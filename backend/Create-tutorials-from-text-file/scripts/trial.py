from flask import Flask, render_template,request,send_file,jsonify
from werkzeug.utils import secure_filename
import os
import trial_ppt as tp
import summary_gen as sg
import question as ques
import create_video as cv
from flask_cors import CORS, cross_origin
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import (create_access_token)
from flask_sqlalchemy import SQLAlchemy
import qa
from tika import parser
from random import randint
import uuid
import json
import web_scraping as ws

UPLOAD_FOLDER = 'static/uploads'
app = Flask(__name__)
CORS(app, expose_headers=["x-suggested-filename"])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}
app.config['JWT_SECRET_KEY'] = 'secret'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = "User"
    username = db.Column(db.String(80), unique=True,primary_key=True)
    password = db.Column(db.String(40), nullable=False)
    email = db.Column(db.String(80), nullable=False)
    role = db.Column(db.String(80), nullable=False)

class Tutorial(db.Model):
    __tablename__ = "Tutorial"
    Tutorial_id=db.Column(db.Integer, unique=True, primary_key=True)
    Tutorial_name=db.Column(db.String(40), nullable=False)
    Tutorial_label=db.Column(db.String(40), nullable=False)
    ppt_path=db.Column(db.String(200),nullable=False)
    pdf_path=db.Column(db.String(200),nullable=False)
    subtopic_mapping=db.Column(db.String(200),nullable=False)
    author=db.Column(db.String(20), db.ForeignKey('User.username'))
    Image_Link=db.Column(db.String(500),nullable=False)

class Assessment(db.Model):
    __tablename__ = "Assessment"
    Question_no=db.Column(db.String(20),unique=True,primary_key=True)
    Tutorial_id=db.Column(db.Integer, db.ForeignKey('Tutorial.Tutorial_id'))
    question=db.Column(db.String(500))
    correct_answer=db.Column(db.String(40))
    answers=db.Column(db.String(200))
    set_number=db.Column(db.Integer)

class UserProgress(db.Model):
    __tablename__ = "UserProgress"
    username=db.Column(db.String, db.ForeignKey('User.username'))
    question_no=db.Column(db.Integer, db.ForeignKey('Assessment.Question_no'))
    answer=db.Column(db.String(200))
    tid=db.Column(db.Integer)
    index=db.Column(db.Integer,primary_key=True)


db.create_all()

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app)

def readfile(filename):
    file_exten = filename.rsplit('.', 1)[1].lower()
    _content=""
    if file_exten == 'pdf':
        raw = parser.from_file(filename)
        _content = raw['content'].replace('\n','')
        #print(_content)

    elif file_exten == 'txt':
        with open(filename, 'r') as txt_file:
            _content = txt_file.read()
            print('TXT operation done!')
    #f=open(filename,'r',errors="ignore",encoding="utf-8")
    #x=f.read()
    return _content
 

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def home():
    return render_template("upload.html")
  
@app.route("/submit",methods=["POST"])
def summary_gen():
    #return "Hello"
    upload_file=request.files["Upload"]
    name=request.form.get("Tname")
    print(request.form)
    label=request.form.get("Label")
    print(label)
    filename = secure_filename(upload_file.filename)
    if upload_file and allowed_file(upload_file.filename):
        upload_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        fname=filename.split(".")[0]+"_summary.pptx"
        vname=filename.split(".")[0]+"_summary.mp4"
        filename=app.config['UPLOAD_FOLDER']+"/"+filename
        print("************* ",filename)
        text=readfile(filename)
        #print(text)
        summary,mapping = sg.processing(text)
        x={'text':text,'summary':summary,'mapping':mapping,'fname':fname,'filename':filename,'tname':name,'label':label} #render_template("hello.html",context={"filename":fname,"Videoname":vname})
        print(x['filename'])
        return x
    else:
        return render_template("wrong_response.html")

@app.route("/ppt",methods=["POST"])
def pptgen():
    print(request)
    data=request.get_json()
    print(data)
    text=data['text1']
    username=data['username']
    summary=data['summary1']
    mapping=data['mapping']
    fname=data['fname']
    name=data['tname']
    label=data['label']
    link=ws.get_links(name)
    print("^^^^^^^^^^^^^^^ ",data['filename'])
    ext=data['filename'].split(".")[-1]
    tid=username+str(uuid.uuid1())
    if ext=='pdf':
        x = tp.pptgen(tp.preprocessing(data['filename']),data['filename'],tid)
    else:
        x=tp.pptgen(["<p>"+text],data["filename"],tid)
    ppt_path=x['ppt_path']
    pdf_path=x['pdf_path']
    subtopic_mapping=x['mapping']
    question_content=x['question_content']
    print("######################")
    print(question_content)
    print("######################")
    cv.PPTtoPDF(ppt_path,pdf_path)
    new_tutorial=Tutorial()
    setattr(new_tutorial,'author',username)
    setattr(new_tutorial,'ppt_path',ppt_path)
    setattr(new_tutorial,'pdf_path',pdf_path)
    setattr(new_tutorial,'subtopic_mapping',str(subtopic_mapping))
    setattr(new_tutorial,'Tutorial_label',label)
    setattr(new_tutorial,'Tutorial_name',name)
    setattr(new_tutorial,'Image_Link',link)
    db.session.add(new_tutorial)
    db.session.commit()
    return {'ppt_path':ppt_path, 'pdf_path':pdf_path,'subtopic_mapping':subtopic_mapping,'tutorial_id':new_tutorial.Tutorial_id,'question_content':question_content}

@app.route('/return-files',methods=["GET"])
def return_files_tut():
    pptname=request.args.get("pptpath")
    result = send_file(pptname, as_attachment=True,conditional=False)
    return result

@app.route('/return-files1',methods=["GET"])
def return_files_tut1():
    pptname=request.args.get("pptpath")
    result = send_file(pptname,conditional=False)
    return result

@app.route('/users/register', methods=['POST'])
def register():
    username = request.get_json()['username']
    email = request.get_json()['email']
    password = bcrypt.generate_password_hash(request.get_json()['password']).decode('utf-8')
    role=request.get_json()['role']
    newuser= User()
    setattr(newuser,'username',username)
    setattr(newuser,'email',email)
    setattr(newuser,'password',password)
    setattr(newuser,'role',role)
    db.session.add(newuser)
    db.session.commit()
    result = {
		'username' : username,
		'email' : email,
		'password' : password,
        'role': role
	}
    print(result)
    return jsonify({'result' : result})
	

@app.route('/users/login', methods=['POST'])
def login():
    username = request.get_json()['username']
    password = request.get_json()['password']
    x=User.query.get(username)
    result=''
    if x:
        if bcrypt.check_password_hash(x.password, password):
            access_token = create_access_token(identity = {'username': username,'email': x.email, 'role':x.role})
            result = access_token
        else:
            result = jsonify({"error":"Invalid username and password"})
    print(result)
    return result

@app.route('/assessments', methods=['POST'])
def assessments():
    print(request.get_json())
    sets=request.get_json()['data']
    tid=request.get_json()['id']
    all_questions={'mcq':[]}
    for j in sets:
        #print("$$$$$$$$$$$$$$$   ",sets,"   $$$$$$$$$$$$$$$$$$$$$")
        qa_module=qa.question_ans_module(sets[j])
        x={'mcq':qa_module.mcq_question()}
        #print(x)
        for i in range(len(x['mcq'])):
            new_assessment=Assessment()
            setattr(new_assessment,'Tutorial_id',tid)
            setattr(new_assessment,'Question_no',str(tid)+"_"+str(j)+"_"+str(i+1))
            setattr(new_assessment,'correct_answer',x['mcq'][i]["answer"])
            setattr(new_assessment,'answers',str(x['mcq'][i]['options']))
            setattr(new_assessment,'question',x['mcq'][i]['question_statement'])
            setattr(new_assessment,'set_number',j)
            db.session.add(new_assessment)
            db.session.commit()
            all_questions['mcq'].append(x['mcq'][i])
    return all_questions

@app.route('/teacher_profile',methods=['POST'])
def gettut():
    username=request.get_json()['username']
    print(username)
    x=db.session.query(Tutorial).filter(Tutorial.author==username).all()
    print(x)
    tutorials=[]
    for row in x:
        t={}
        t['name']=row.Tutorial_name
        t['label']=row.Tutorial_label
        t['subtopic_mapping']=eval(row.subtopic_mapping)
        t['pdf_path']=row.pdf_path
        t['ppt_path']=row.ppt_path
        t['author']=username
        t['url']=row.Image_Link
        y=db.session.query(Assessment).filter(Assessment.Tutorial_id==row.Tutorial_id).all()
        mcq={}
        index=0
        for m in y:
            temp={}
            temp['question_statement']=m.question
            temp['answer']=m.correct_answer
            temp['options']=eval(m.answers)
            mcq[index]=temp
            index+=1
        t['mcq']=mcq
        tutorials.append(t)
    return json.dumps(tutorials)

@app.route('/featured_tutorials')
def getall():
    x=db.session.query(Tutorial).all()[:6]
    print(x)
    tutorials=[]
    for row in x:
        t={}
        t['name']=row.Tutorial_name
        t['label']=row.Tutorial_label
        t['subtopic_mapping']=eval(row.subtopic_mapping)
        t['pdf_path']=row.pdf_path
        t['ppt_path']=row.ppt_path
        t['url']=row.Image_Link
        t['id']=row.Tutorial_id
        y=db.session.query(Assessment).filter(Assessment.Tutorial_id==row.Tutorial_id).all()
        mcq={}
        index=0
        for m in y:
            temp={}
            temp['question_statement']=m.question
            temp['answer']=m.correct_answer
            temp['options']=eval(m.answers)
            mcq[index]=temp
            index+=1
        t['mcq']=mcq
        tutorials.append(t)
    return json.dumps(tutorials)

@app.route('/set_answers', methods=['POST'])
def set_answers():
    qno=request.get_json()['question_number']
    tid=request.get_json()['id']
    username=request.get_json()['username']
    answer=request.get_json()['answer']
    new_entry=UserProgress()
    setattr(new_entry,'tid',tid)
    setattr(new_entry,'question_no',qno)
    setattr(new_entry,'answer',answer)
    setattr(new_entry,'username',username)
    db.session.add(new_entry)
    db.session.commit()  
    return {},200  

@app.route('/get_question_sets',methods=['POST'])
def get_question_sets():
    tid=request.get_json()['tid']
    setid=request.get_json()['setid']
    if setid=='All':
        x=db.session.query(Assessment).filter(Assessment.Tutorial_id==tid).all()
    else:
        x=db.session.query(Assessment).filter(Assessment.Tutorial_id==tid,Assessment.set_number==setid).all()
    questions=[]
    for mcq in x:
        temp={}
        temp["question"]=mcq.question
        temp["answers"]=eval(mcq.answers)
        temp["correct_answer"]=mcq.correct_answer
        questions.append(temp)
    print(questions)
    return json.dumps(questions)

@app.route('/get_tutorial_info',methods=['POST'])
def get_tutorial_info():
    tid=request.get_json()['tid']
    x=db.session.query(Tutorial).filter(Tutorial.Tutorial_id==tid).all()[0]
    return {'pdf_path':x.pdf_path,'ppt_path':x.ppt_path,'subtopic_mapping':eval(x.subtopic_mapping)}

@app.route('/check_set_attempted',methods=['POST'])
def check_set_attempted():
    tid=request.get_json()['tid']
    username=request.get_json()['username']
    set_number=request.get_json()['set_number']
    # x=db.session.query(UserProgress).filter(UserProgress.username==username,UserProgress.tid==tid).all()
    y=UserProgress.query.join(Assessment,Assessment.Question_no==UserProgress.question_no).add_columns(Assessment.correct_answer,UserProgress.answer,Assessment.question,Assessment.answers).filter(UserProgress.username==username,UserProgress.tid==tid,Assessment.set_number==set_number).all()
    questions=[]
    if y:
        score=0
        for question in y:
            temp={}
            if question.correct_answer==question.answer:
                score+=1
            temp['question']=question.question
            temp['answers']=eval(question.answers)
            temp['correct_answer']=question.correct_answer
            temp['user_answer']=question.answer
            questions.append(temp)
        print({"attempted":True,"score":score,"total":len(y)})
        return {"attempted":True,"score":score,"total":len(y),"questions":questions}
    else:
        print({"attempted":False})
        return {"attempted":False}

@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r
    

if __name__ == "__main__":
  app.run(debug=True)
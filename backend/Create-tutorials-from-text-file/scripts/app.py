from flask import Flask, render_template,request,send_file,jsonify
from werkzeug.utils import secure_filename
import os
import trial_ppt_copy as tp
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
from gtts import gTTS
from whitenoise import WhiteNoise
from sqlalchemy.sql import func
from sqlalchemy import distinct
import time
import fitz
from langdetect import detect
from google_trans_new import google_translator


UPLOAD_FOLDER = 'static/uploads'
DOWNLOAD_FOLDER = 'static/downloads'
app = Flask(__name__)
app.wsgi_app = WhiteNoise(app.wsgi_app, root=os.path.join(os.path.dirname(__file__), 'static'))
app.wsgi_app.add_files(UPLOAD_FOLDER)
app.wsgi_app.add_files(DOWNLOAD_FOLDER)
CORS(app, expose_headers=["x-suggested-filename"])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}
app.config['JWT_SECRET_KEY'] = 'secret'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///static/db.sqlite3'
app.wsgi_app.add_files('static/db.sqlite3')
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
    subtopic_mapping=db.Column(db.String(20000),nullable=False)
    author=db.Column(db.String(20), db.ForeignKey('User.username'))
    Image_Link=db.Column(db.String(500),nullable=False)
    page_mapping=db.Column(db.String(20000),nullable=False)

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

class Feedback(db.Model):
    __tablename__="Feedback"
    username=db.Column(db.String, db.ForeignKey('User.username'))
    tid=db.Column(db.Integer, db.ForeignKey('Tutorial.Tutorial_id'))
    tut_score=db.Column(db.Integer)
    mcq_score=db.Column(db.Integer)
    ppt_score=db.Column(db.Integer)
    ui_score=db.Column(db.Integer)
    user_friendliness=db.Column(db.Integer)
    feedback_comment=db.Column(db.String(200))
    index=db.Column(db.Integer,primary_key=True)


db.create_all()

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app)

prefix_pic = './static/Pictures/'
prefix_voice = './static/voiceovers/'


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
    return _content
 

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_dummy_record():
    new_tutorial=Tutorial()
    setattr(new_tutorial,'author','')
    setattr(new_tutorial,'ppt_path','')
    setattr(new_tutorial,'pdf_path','')
    setattr(new_tutorial,'subtopic_mapping','')
    setattr(new_tutorial,'Tutorial_label','')
    setattr(new_tutorial,'Tutorial_name','')
    setattr(new_tutorial,'Image_Link','')
    setattr(new_tutorial,'page_mapping','')
    db.session.add(new_tutorial)
    db.session.commit()
    return new_tutorial.Tutorial_id

def lang_detect(text):
    return detect(text)

@app.route("/")
def home():
    return render_template("upload.html")
  
@app.route("/submit",methods=["POST"])
def summary_gen():
    upload_file=request.files["Upload"]
    name=request.form.get("Tname")
    print(request.form)
    label=request.form.get("Label")
    print(label)
    filename = secure_filename(upload_file.filename)
    if upload_file and allowed_file(upload_file.filename):
        upload_file.save(os.path.join(UPLOAD_FOLDER, filename))
        fname=filename.split(".")[0]+"_summary.pptx"
        vname=filename.split(".")[0]+"_summary.mp4"
        filename=app.config['UPLOAD_FOLDER']+"/"+filename
        print("************* ",filename)
        text=readfile(filename)
        lang=lang_detect(text)
        summary,mapping = sg.processing(text,lang)
        x={'text':text,'summary':summary,'mapping':mapping,'fname':fname,'filename':filename,'tname':name,'label':label} #render_template("hello.html",context={"filename":fname,"Videoname":vname})
        print(x["text"])
        file1=open("kannada_writing.txt",'w',errors="ignore")
        file1.write(text)
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
    tut_id=create_dummy_record()
    os.mkdir(prefix_pic+str(tut_id))
    os.mkdir(prefix_voice+str(tut_id))
    print("^^^^^^^^^^^^^^^ ",data['filename'])
    filename=data['filename']
    ext=data['filename'].split(".")[-1]
    tid=username+str(uuid.uuid1())
    if ext=='pdf':
        pic_location=prefix_pic+str(tut_id)+"/"
        voiceover_location=prefix_voice+str(tut_id)+"/"
        x = tp.generate_metadata(filename,tid,pic_location,voiceover_location)
    else:
        x=tp.pptgen(["<p>"+text],data["filename"],tid)
    ppt_path=x['ppt_path']
    pdf_path=x['pdf_path']
    subtopic_mapping=str(x['mapping'])
    question_content=x['question_content']
    print("######################")
    #print(subtopic_mapping)
    print("######################")
    tutorial = Tutorial.query.filter_by(Tutorial_id=tut_id).first()
    tutorial.author=username
    tutorial.ppt_path=ppt_path
    tutorial.pdf_path=pdf_path
    tutorial.subtopic_mapping=subtopic_mapping
    tutorial.Tutorial_label=label
    tutorial.Tutorial_name=name
    tutorial.Image_Link=link
    tutorial.page_mapping=str(x["modified_dict"])
    db.session.commit()
    return {'ppt_path':ppt_path, 'pdf_path':pdf_path,'subtopic_mapping':subtopic_mapping,'tutorial_id':tut_id,'question_content':question_content,"page_mapping":x["modified_dict"]}

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

def create_set(text):
    lines=text.split(".")
    translator = google_translator()
    final=''
    temp=''
    for i in lines:
        if(len(temp+i)<5000):
            temp=temp+i
        else:
            temp=''
        final+=translator.translate(temp,lang_tgt='en')
    return final

def create_set_for_questions(text):
    lines=text.split(".")
    final=''
    temp=''
    l=[]
    for i in lines:
        if(len(temp+i)<500):
            temp=temp+i
        else:
            l.append(temp)
            temp=''
        final+=translator.translate(temp,lang_tgt='en')
    return final

@app.route('/assessments', methods=['POST'])
def assessments():
    print(request.get_json())
    translator = google_translator()
    sets=request.get_json()['data']
    lang=lang_detect(sets[list(sets.keys())[0]])
    tid=request.get_json()['id']
    all_questions={'mcq':[]}
    for j in sets:
        #print("$$$$$$$$$$$$$$$   ",sets,"   $$$$$$$$$$$$$$$$$$$$$")
        if lang!="en":
            sets[j]=create_set(sets[j])
            print("Set data --- ",sets[j])
        qa_module=qa.question_ans_module(sets[j])
        x={'mcq':qa_module.mcq_question()}
        #print(x)
        for i in range(len(x['mcq'])):
            new_assessment=Assessment()
            setattr(new_assessment,'Tutorial_id',tid)
            setattr(new_assessment,'Question_no',str(tid)+"_"+str(j)+"_"+str(i+1))
            if(lang!="en"):
                answer=translator.translate(x['mcq'][i]["answer"],lang_tgt=lang)
                mcqs=[]
                for j in x['mcq'][i]['options']:
                    mcqs.append(translator.translate(j,lang_tgt=lang))
                question=translator.translate(x['mcq'][i]['question_statement'],lang_tgt=lang)
            else:
                answer=x['mcq'][i]["answer"]
                mcqs=x['mcq'][i]['options']
                question=x['mcq'][i]['question_statement']
            print("QA generated -- ", question, mcqs, answer)
            setattr(new_assessment,'correct_answer',answer)
            setattr(new_assessment,'answers',str(mcqs))
            setattr(new_assessment,'question',question)
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
    print(tid,setid)
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
    return {'pdf_path':x.pdf_path,'ppt_path':x.ppt_path,'subtopic_mapping':eval(x.subtopic_mapping),'page_mapping':list(eval(x.page_mapping).values())}

@app.route('/check_set_attempted',methods=['POST'])
def check_set_attempted():
    tid=request.get_json()['tid']
    username=request.get_json()['username']
    set_number=request.get_json()['set_number']
    print(tid,set_number)
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

@app.route('/collect_feedback',methods=['POST'])
def collect_feedback():
    req=request.get_json()
    username=req['username']
    tid=req['tid']
    tut_score=req['tut_score']
    mcq_score=req['mcq_score']
    ppt_score=req['ppt_score']
    ui_score=req['ui_score']
    user_friendliness=req['user_friendliness']
    feedback_comment=req['feedback_comment']
    new_entry=Feedback()
    setattr(new_entry,'username',username)
    setattr(new_entry,'tid',tid)
    setattr(new_entry,'tut_score',tut_score)
    setattr(new_entry,'mcq_score',mcq_score)
    setattr(new_entry,'ppt_score',ppt_score)
    setattr(new_entry,'ui_score',ui_score)
    setattr(new_entry,'user_friendliness',user_friendliness)
    setattr(new_entry,'feedback_comment',feedback_comment)
    db.session.add(new_entry)
    db.session.commit()
    return {},200

@app.route('/get_all_data_user_statistics')
def get_data():
    feedback={}
    x=Feedback.query.all()
    print(x)
    #y=Feedback.query.join(Tutorial,Tutorial.Tutorial_id==Feedback.tid).add_columns(Tutorial.Tutorial_name,Feedback.tid,Feedback.tut_score,Feedback.ppt_score,Feedback.mcq_score,Feedback.ui_score,Feedback.user_friendliness,Feedback.feedback_comment).all()
    score_avg = db.session.query(func.avg(Feedback.tut_score).label("avg_tut_score"),func.avg(Feedback.mcq_score).label("avg_mcq_score"),func.avg(Feedback.ppt_score).label("avg_ppt_score"),func.avg(Feedback.ui_score).label("avg_ui_score"),func.avg(Feedback.user_friendliness).label("avg_user_friendliness")).all()
    avg_scores={}
    avg_scores['Avg_tut_score']=score_avg[0][0]
    avg_scores['Avg_ui_score']=score_avg[0][3]
    avg_scores['Avg_ppt_score']=score_avg[0][2]
    avg_scores['Avg_mcq_score']=score_avg[0][1]
    avg_scores['Avg_user_friendliness']=score_avg[0][4]
    #z=UserProgress.query.join(Assessment,Assessment.Question_no==UserProgress.question_no).filter(UserProgress.answer==Assessment.correct_answer).group_by(UserProgress.username).add_columns(func.count(UserProgress.answer).label("tut_score"),UserProgress.tid).group_by(UserProgress.tid).all()
    mcq_scores=UserProgress.query.join(Assessment,Assessment.Question_no==UserProgress.question_no).filter(UserProgress.answer==Assessment.correct_answer).add_columns(func.count(UserProgress.answer).label("tut_score"),UserProgress.tid).group_by(UserProgress.tid).subquery()
    y=UserProgress.query.join(mcq_scores,UserProgress.tid==mcq_scores.c.tid).add_columns((mcq_scores.c.tut_score/func.count(distinct(UserProgress.username))).label("average_score"),func.count(distinct(UserProgress.username)).label("user_count"),UserProgress.tid).group_by(mcq_scores.c.tid).subquery()
    # total_count=db.session.query(Assessment).add_columns(func.count(Assessment.Question_no).label("total_number"),Assessment.tid).group_by(Assessment.tid).subquery()
    final_avg_scores=Tutorial.query.join(y,y.c.tid==Tutorial.Tutorial_id).add_columns(y.c.average_score,Tutorial.Tutorial_name,y.c.tid,y.c.user_count).subquery()
    final_final=Assessment.query.join(final_avg_scores,final_avg_scores.c.tid==Assessment.Tutorial_id).add_columns(final_avg_scores.c.average_score.label("avg_score"),final_avg_scores.c.Tutorial_name,func.count(Assessment.Question_no).label("max_score"),final_avg_scores.c.user_count).group_by(final_avg_scores.c.tid).all()
    print(y)
    print(final_avg_scores)
    print(final_final)
    cols=["avg_score","Tutorial_name","max_score","user_count"]
    return {"scores":avg_scores,"feedback":[dict([(col, str(getattr(i,col))) for col in i.__table__.columns.keys()]) for i in x],"tutorial_statistics":[dict([(col, str(getattr(i,col))) for col in cols]) for i in final_final]}

@app.route('/student-profile',methods=["POST"])
def student_profile():
    req=request.get_json()
    username=req['username']
    y=UserProgress.query.join(Assessment,Assessment.Question_no==UserProgress.question_no).filter(UserProgress.username==username, UserProgress.answer==Assessment.correct_answer).add_columns(func.count(UserProgress.answer).label("tut_score"),UserProgress.tid).group_by(UserProgress.tid).subquery()
    final_avg_scores=Tutorial.query.join(y,y.c.tid==Tutorial.Tutorial_id).add_columns(y.c.tut_score,Tutorial.Tutorial_name,y.c.tid).subquery()
    final_final=Assessment.query.join(final_avg_scores,final_avg_scores.c.tid==Assessment.Tutorial_id).add_columns(final_avg_scores.c.tut_score.label("user_score"),final_avg_scores.c.Tutorial_name,final_avg_scores.c.tid,func.count(Assessment.Question_no).label("max_score")).group_by(final_avg_scores.c.tid).all()
    print(final_final)
    cols=["user_score","Tutorial_name","max_score"]
    return json.dumps([dict([(col, str(getattr(i,col))) for col in cols]) for i in final_final]),200

@app.route('/picture-gallery',methods=["POST"])
def picture_gallery():
    req=request.get_json()
    tut_id=req['id']
    paths=[]
    for i in os.listdir(prefix+str(tut_id)):
        paths.append(os.path.abspath(prefix+str(tut_id)+"/"+i))
    return json.dumps(paths)


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
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0",port=port,debug=True)
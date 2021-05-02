import nltk
nltk.download('stopwords')

from pprint import pprint
from Questgen import main

class question_ans_module:
    def __init__(self,input_text):
        self.payload = {}
        self.payload["input_text"]=input_text
    
    def bool_question(self):
        qe= main.BoolQGen()
        output = qe.predict_boolq(self.payload)
        return output["Boolean Questions"][0]

    def mcq_question(self):
        qg = main.QGen()

        output = qg.predict_mcq(self.payload)
        print(output)
        if('questions' not in output):
            return {}
        questions=output['questions']
        print("*************  ",len(questions),"   ***************")
        mcqs={}
        for i in range(len(questions)):
            mcqs[i]={}
            mcqs[i]['question_statement']=questions[i]['question_statement']
            mcqs[i]['answer']=questions[i]['answer']
            mcqs[i]['options']=[mcqs[i]['answer']]+questions[i]['options']+questions[i]['extra_options']
            mcqs[i]['options']=mcqs[i]['options'][:4]
        return mcqs
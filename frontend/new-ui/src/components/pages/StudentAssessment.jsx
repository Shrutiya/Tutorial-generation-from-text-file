import React from 'react';
import './studentass.css';
import Question from './StudentAssessment/Question';
import Quiz from './StudentAssessment/Quiz';
import Result from './StudentAssessment/Result';
import jwt_decode from 'jwt-decode';
import { Link, withRouter } from 'react-router-dom'
import Completed from './StudentAssessment/completed_quiz'
class Sassessment extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          counter: 0,
          questionId: 1,
          question: '',
          answerOptions: '',
          answer: '',
          answersCount: {},
          result: '',
          mcq: '',
          correct_answer: '',
          score:0,
          tid: this.props.location.tid,
          setid:this.props.location.data,
          topic:this.props.location.topic,
          total:0,
          completed:'',
          no_of_topics:this.props.location.topic_length
        };
        // console.log(this.state)
        this.handleAnswerSelected = this.handleAnswerSelected.bind(this);
        this.shuffle=this.shuffle.bind(this);
        // this.setUserAnswer=this.setUserAnswer.bind(this);
      }
      shuffle(array) {
        console.log("hi");
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
      }
      componentWillMount(){
        fetch('http://localhost:5000/check_set_attempted', {
      method: 'POST',
      body:JSON.stringify({'tid':this.state.tid,'set_number':this.state.setid,'username':jwt_decode(localStorage.usertoken).identity.username}),
      headers: new Headers({
        "content-type": "application/json"
      })
    }).then((response) => {
      response.json().then((body) => {
        console.log(body);
        if(body.attempted==false){
        fetch('http://localhost:5000/get_question_sets', {
      method: 'POST',
      body:JSON.stringify({'tid':this.state.tid,'setid':this.state.setid}),
      headers: new Headers({
        "content-type": "application/json"
      })
    }).then((response) => {
      response.json().then((body) => {
        console.log(body);
        this.setState({mcq:body});
        for(var i=0;i<this.state.mcq.length;i++){
          this.state.mcq[i]["answers"]=this.shuffle(this.state.mcq[i]["answers"])
        }
        this.setState({question:this.state.mcq[0]["question"],answerOptions:this.state.mcq[0]["answers"],correct_answer:this.state.mcq[0]["correct_answer"],total:this.state.mcq.length});
        console.log(this.state);
    });
    })
  }
  else{
    this.setState({score:body.score,total:body.total,result:true,question:"hello",completed:body.questions})
  }
  });
})}
      setUserAnswer(answer) {
        this.setState((state, props) => ({
          score: (this.state.correct_answer===answer)?this.state.score+1:this.state.score,
          answer: answer
        }));
        console.log(this.state)
        fetch('http://localhost:5000/set_answers', {
      method: 'POST',
      body: JSON.stringify({'question_number':this.state.tid.toString()+"_"+this.state.setid.toString()+"_"+this.state.questionId,'answer':answer,'username':jwt_decode(localStorage.usertoken).identity.username,'id':this.state.tid}),
      headers: new Headers({
        "content-type": "application/json"
      }),
    })}
      setNextQuestion() {
          console.log("setnext");
        const counter = this.state.counter + 1;
        const questionId = this.state.questionId + 1;
        this.setState({
          counter: counter,
          questionId: questionId,
          question: this.state.mcq[counter]["question"],
          answerOptions: this.state.mcq[counter]["answers"],
          answer: '',
          correct_answer: this.state.mcq[counter]["correct_answer"]
        });
      }
      handleAnswerSelected(event) {
        console.log("handle")
        this.setUserAnswer(event.currentTarget.value);
        if (this.state.questionId < Object.keys(this.state.mcq).length) {
          if(this.state.answer===this.state.correct_answer){
            setTimeout(() => this.setNextQuestion(), 300);
          }
          else{
            setTimeout(() => this.setNextQuestion(), 3000);
          }
          } else {
            setTimeout(() => this.setResults(this.state.score), 300);
          }
      }
    
      setResults(result) {
          this.setState({ result: true });
      }

    renderQuiz(){
        return (
            <Quiz
        answer={this.state.answer}
        answerOptions={this.state.answerOptions}
        questionId={this.state.questionId}
        question={this.state.question}
        questionTotal={Object.keys(this.state.mcq).length}
        onAnswerSelected={this.handleAnswerSelected}
        correct_answer={this.state.correct_answer}
      />
        );
    }

    renderResult() {
      console.log(this.state)
      return (<div>
        <center><h1>Your performance</h1></center>
        {this.state.completed?<Completed questions={this.state.completed}/>:null}
        <Result quizResult={this.state.score} full={this.state.total} />
        {this.state.topic+1>=this.state.no_of_topics?(<div><h1>You've completed the tutorial</h1>
        <br></br><Link to={{pathname:"/collect_feedback",tid:this.state.tid}}>
      <button  className="btn-secondary btn-lg">Give feedback</button></Link></div>):null}
        <br></br>
        <Link to={{pathname:"/ppt",topic:this.state.topic+1>=this.state.no_of_topics?0:this.state.topic+1,tid:this.state.tid}}>
      <button  className="btn-secondary btn-lg">Go back to tutorial</button></Link>
        </div>);
    }

    render(){
      console.log(this.state);
      if(this.state.question){
      return (
        (<div>
        {this.state.result ? this.renderResult() : this.renderQuiz()}
        </div>)
      )}
      else{
        return null;
      }
    }
}

export default Sassessment;
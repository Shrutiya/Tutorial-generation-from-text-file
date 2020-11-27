import React from 'react';
import PropTypes from 'prop-types';
import Question from './Question';
import QuestionCount from './QuestionCount';
import AnswerOption from './AnswerOption';
import { CSSTransitionGroup } from 'react-transition-group';

function Completed(props) {
    console.log(props);
    function renderAnswerOptions(question,key) {
        return (
          <AnswerOption
            key={key}
            answerContent={key}
            // answerType={key.type}
            answer={question["user_answer"]}
            correct_answer={question["correct_answer"]}
            onAnswerSelected={props.onAnswerSelected}
            status="taken"
          />
        );
      }
        return (
            props.questions.map((question,index)=>{
                return (
      <CSSTransitionGroup
      className="container"
      component="div">
        <div key={index+1}>
          <QuestionCount
            counter={index+1}
            total={props.questions.length}
          />
          <Question content={question["question"]} />
          <ul className="answerOptions">
            {question["answers"].map(function (key) {
             return renderAnswerOptions(question, key);})}
          </ul>
          <br></br>
          {question["user_answer"]!==question["correct_answer"]? <h2>Correct answer is {question["correct_answer"]}</h2>:false}
        </div>
        </CSSTransitionGroup>)
    }
    ));
}
  
  export default Completed;
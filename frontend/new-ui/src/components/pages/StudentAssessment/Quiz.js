import React from 'react';
import PropTypes from 'prop-types';
import Question from './Question';
import QuestionCount from './QuestionCount';
import AnswerOption from './AnswerOption';
import { CSSTransitionGroup } from 'react-transition-group';

function Quiz(props) {
    console.log(props);
    function renderAnswerOptions(key) {
        return (
          <AnswerOption
            key={key}
            answerContent={key}
            // answerType={key.type}
            answer={props.answer}
            questionId={props.questionId}
            correct_answer={props.correct_answer}
            onAnswerSelected={props.onAnswerSelected}
            status="not_taken"
          />
        );
      }
    return (
      <CSSTransitionGroup
      className="container"
      component="div"
      transitionName="fade"
      transitionEnterTimeout={800}
      transitionLeaveTimeout={500}
      transitionAppear
      transitionAppearTimeout={500}
    >
        <div key={props.questionId}>
          <QuestionCount
            counter={props.questionId}
            total={props.questionTotal}
          />
          <Question content={props.question} />
          <ul className="answerOptions">
            {props.answerOptions.map(renderAnswerOptions)}
          </ul>
          <br></br>
          {props.answer && props.answer!==props.correct_answer? <h2>Correct answer is {props.correct_answer}</h2>:false}
        </div>
        </CSSTransitionGroup>
    );
  }
  
//   Quiz.propTypes = {
//     answer: PropTypes.string.isRequired,
//     answerOptions: PropTypes.array.isRequired,
//     counter: PropTypes.number.isRequired,
//     question: PropTypes.string.isRequired,
//     questionId: PropTypes.number.isRequired,
//     questionTotal: PropTypes.number.isRequired,
//     onAnswerSelected: PropTypes.func.isRequired
//   };
  
  export default Quiz;
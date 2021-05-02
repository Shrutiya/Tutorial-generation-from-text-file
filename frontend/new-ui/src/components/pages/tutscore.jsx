import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
class Tutorialscore extends React.Component{
    constructor(props){
        super(props);
        this.state=props;
        console.log(this.state)
        this.correct=((this.state.user_score/this.state.max_score)*100).toFixed(2);
        this.wrong=100-this.correct;
    }
    render(){
        return(
               <div><h2>{this.state.tutorial_name}</h2><ProgressBar><ProgressBar animated variant="success"  now={this.correct} label={this.correct.toString()+"%"} key={1}/><ProgressBar animated variant="danger" now={this.wrong} key={2} label={this.wrong.toString()+"%"}/></ProgressBar></div>
        )
    }
}
export default Tutorialscore;
import React from 'react';
import './content.css';
import jwt_decode from 'jwt-decode';
import Rating from 'react-rating'; 
import { BrowserRouter as Router, Switch, Route, Link, useParams} from 'react-router-dom';

class Feedback extends React.Component{
    constructor(props){
        super(props);
        this.state={
            username:jwt_decode(localStorage.usertoken).identity.username,
            tid:this.props.location.tid,
            tut_score:0,
            mcq_score:0,
            ppt_score:0,
            ui_score:0,
            user_friendliness:0,
            feedback_comment:'',
            submit:false
        };
        this.collect_feedback=this.collect_feedback.bind(this)
    }
    collect_feedback(ev){
        ev.preventDefault();
        var x=document.getElementById("feedback").value;
        this.setState({feedback_comment:x});
        console.log(document.getElementById("feedback").value);
        var data=this.state;
        data['feedback_comment']=x;
        console.log(data);
        fetch('http://localhost:5000/collect_feedback', {
      method: 'POST',
      body:JSON.stringify(data),
      headers: new Headers({
        "content-type": "application/json"
      })
    });
    this.setState({submit:true})
    }
    render(){
        return(
            <div>
    {!this.state.submit &&
            (<form onSubmit={this.collect_feedback}>
                <div className="container">
                    <h3>Please rate the tutorial on a scale of 1-10</h3>
                    <h5>Factors to be considered - Quality of Tutorial, Comprehensibilty, Relevance, etc</h5>
                    <br></br>
                    <Rating start={0} stop={10} onClick={rate => this.setState({tut_score:rate})} initialRating={this.state.tut_score}/>
                </div>

                <div className="container">
                    <h3>Please rate the assesments on a scale of 1-10</h3>
                    <h5>Factors to be considered - Quality of assesments, Quality of distractors, Relevance, etc</h5>
                    <br></br>
                    <Rating start={0} stop={10} onClick={rate => this.setState({mcq_score:rate})} initialRating={this.state.mcq_score}/>
                </div>

                <div className="container">
                    <h3>Please rate the PPT on a scale of 1-10</h3>
                    <h5>Factors to be considered - Quality of PPT, Comprehensibilty, Structure, etc</h5>
                    <br></br>
                    <Rating start={0} stop={10} onClick={rate => this.setState({ppt_score:rate})} initialRating={this.state.ppt_score}/>
                </div>

                <div className="container">
                    <h3>Please rate the user interface on a scale of 1-10</h3>
                    <h5>Factors to be considered - Look and feel, Styling, Responsiveness, Design etc</h5>
                    <br></br>
                    <Rating start={0} stop={10} onClick={rate => this.setState({ui_score:rate})} initialRating={this.state.ui_score}/>
                </div>

                <div className="container">
                    <h3>Please rate the User Friendliness of the Web Interface on a scale of 1-10</h3>
                    <h5>Factors to be considered - Ease of use, Navigation, Comprehensibilty, etc</h5>
                    <br></br>
                    <Rating start={0} stop={10} onClick={rate => this.setState({user_friendliness:rate})} initialRating={this.state.user_friendliness}/>
                </div>

                <div className="container">
                    <h3>Additional feedback</h3>
                    <h5>Any comments, criticism or appreciation is welcome</h5>
                    <br></br>
                    <center><textarea id="feedback"></textarea></center>
                    <br></br>
                </div>

                <center><button type="submit" className="btn-secondary btn-lg">Give Feedback</button></center>
            </form>)}
            {this.state.submit && (<div><center><br></br><h1>Thank you for your valuable feedback</h1><br></br><Link to={{pathname:"/ppt",topic:0}}>
      <button  className="btn-secondary btn-lg">Go back to tutorial</button></Link><br></br><br></br><Link to={{pathname:"/"}}>
      <button  className="btn-secondary btn-lg">Go back to Home</button></Link></center></div>)}
            </div>
        )
    }
}
export default Feedback;
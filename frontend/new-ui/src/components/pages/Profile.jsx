import React, { Component } from 'react'
import jwt_decode from 'jwt-decode'
import CardItem from '../CardItem';
import Tutorialscore from './tutscore';
import '../Cards.css';
class Profile extends Component {
  constructor() {
    super()
    this.state = {
      username: '',
      email: '',
      role: '',
      errors: {},
      tutorials:{},
      items:[],
    }
    this.numberRange=this.numberRange.bind(this);
  }

  numberRange (start, end) {
    return new Array(end - start).fill().map((d, i) => i + start);
  }

  componentDidMount() {
    if(this.state.role==="teacher"){
    fetch('http://localhost:5000/teacher_profile', {
      method: 'POST',
      body:JSON.stringify({'username':this.state.username}),
      headers: new Headers({
        "content-type": "application/json"
      }),
    }).then((response) => {
      response.json().then((body) => {
        this.setState({tutorials:body});
        //console.log(this.state.tutorials[0]['name']);
        //this.state.items = [];
        var l=[];
    for(var index=0;index<Object.keys(this.state.tutorials).length;index+=3){
    l.push(<ul className='cards__items'>
      {index<Object.keys(this.state.tutorials).length?
      <CardItem
        src={this.state.tutorials[index]['url']}
        text={this.state.tutorials[index]['name']}
        label={this.state.tutorials[index]['label']}
        path={{pathname:"/ppt/"+this.state.tutorials[index]["name"]+"_"+this.state.tutorials[index]["label"],mapping:this.state.tutorials[index]["subtopic_mapping"],pdf_path:this.state.tutorials[index]["pdf_path"],ppt_path:this.state.tutorials[index]["ppt_path"],mcq:this.state.tutorials[index]["mcq"]}}
      />
      :false}
      {index+1<Object.keys(this.state.tutorials).length?
      <CardItem
        src={this.state.tutorials[index+1]['url']}
        text={this.state.tutorials[index+1]['name']}
        label={this.state.tutorials[index+1]['label']}
        path={{pathname:"/ppt/"+this.state.tutorials[index+1]["name"]+"_"+this.state.tutorials[index+1]["label"],mapping:this.state.tutorials[index+1]["subtopic_mapping"],pdf_path:this.state.tutorials[index+1]["pdf_path"],ppt_path:this.state.tutorials[index+1]["ppt_path"],mcq:this.state.tutorials[index+1]["mcq"]}}
      />
      :false}
      {index+2<Object.keys(this.state.tutorials).length?
      <CardItem
        src={this.state.tutorials[index+2]['url']}
        text={this.state.tutorials[index+2]['name']}
        label={this.state.tutorials[index+2]['label']}
        path={{pathname:"/ppt/"+this.state.tutorials[index+2]["name"]+"_"+this.state.tutorials[index+2]["label"],mapping:this.state.tutorials[index+2]["subtopic_mapping"],pdf_path:this.state.tutorials[index+2]["pdf_path"],ppt_path:this.state.tutorials[index+2]["ppt_path"],mcq:this.state.tutorials[index+2]["mcq"]}}
      />
      :false}
    </ul>)
    }
    this.setState({items:l});
        // this.setState({onsubmit:true});
        console.log(this.state.items)
    });
  })
  }
  else{
    fetch('http://localhost:5000/student-profile', {
      method: 'POST',
      body:JSON.stringify({'username':this.state.username}),
      headers: new Headers({
        "content-type": "application/json"
      }),
    }).then((response) => {
      response.json().then((body) => {
        this.setState({scores:body})
  
  var l=[<table></table>];
  for(var i=0;i<this.state.scores.length;i++){
    l.push(<div><Tutorialscore user_score={this.state.scores[i]["user_score"]} max_score={this.state.scores[i]["max_score"]} tutorial_name={this.state.scores[i]["Tutorial_name"]}/><hr></hr></div>)
  }
  this.setState({items:l});
})})
}
  }

  componentWillMount(){
    const token = localStorage.usertoken
    const decoded = jwt_decode(token)
    this.setState({
      username: decoded.identity.username,
      email: decoded.identity.email,
      role: decoded.identity.role
    })
}

  render() {
    // console.log(this.state.tutorials[0]['name'])
    
    console.log(this.numberRange(5,8))
    const teacher=
    <div><h3>Your tutorials</h3>
      <div className='cards__wrapper'>
        {this.state.items}
      </div></div>
    const student=<div><h3>Your Progress</h3><hr></hr>{this.state.items}</div>
    return (
      <div className="container">
        <center>
        <div>
          <div className="col-sm-8 mx-auto">
            <center><h1 className="text-body">PROFILE</h1></center>
          </div>
          <table className="table col-md-6 mx-auto" align="center">
            <tbody className="text-body">
              <tr>
                <td>Username</td>
                <td>{this.state.username}</td>
              </tr>
              <tr>
                <td>Role</td>
                <td>{this.state.role==="student"?"subscriber":"generator"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        </center>
        <br></br>
        {this.state.role==="teacher"?teacher:student}
      </div>
    )
  }
}

export default Profile
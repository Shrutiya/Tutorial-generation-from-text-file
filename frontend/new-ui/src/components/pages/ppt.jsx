import React from 'react';
import './Products.css';
import CardItem from './CardItem';
import Tutorial from './Tutorial';
import { BrowserRouter as Router, Switch, Route, Link, useParams} from 'react-router-dom';
// import '../Sidebar.css';
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import Iframe from 'react-iframe'
import './Upload.css'
import jwt_decode from 'jwt-decode'
import Content from './content';
import './content.css'

class ppt extends React.Component {
    constructor(props){
        super(props);
        console.log(this.props)
        this.openFullscreen=this.openFullscreen.bind(this);
        this.print=this.print.bind(this);
        this.state={
            hierarchy: '',
            // hierarchy: [{'heading': 'What is Information Retrieval?', 'level': 1, 'pgno': 1, 'children': [], 'content': 'Information Retrieval   can be defined as a software program that deals with the organization, storage, retrieval, and evaluation of information from document repositories, particularly textual information. Information Retrieval is the activity of obtaining material that can usually be documented on an unstructured nature   i.e. usually text which satisfies an information need from within large collections which is stored on computers. For example, Information Retrieval can be when a user enters a query into the system.   Not only librarians, professional searchers, etc engage themselves in the activity of  information retrieval but nowadays hundreds of millions of people engage in IR every  day when they use web search engines. Information Retrieval is believed to be the  dominant form of Information access. The IR system assists the users in finding the  information they require but it does not explicitly return the answers to the question. It  notifies regarding the existence and location of documents that might consist of the  required information. Information retrieval also extends support to users in browsing or  filtering document collection or processing a set of retrieved documents. The system searches over billions of documents stored on millions of computers. A spam filter,  manual or automatic means are provided by Email program for classifying the mails so  that it can be placed directly into particular folders. ', 'parent': 0}, {'heading': 'What is an IR Model? ', 'level': 1, 'pgno': 3, 'children': [], 'content': 'An Information Retrieval (IR) model selects and ranks the document that is required by  the user or the user has asked for in the form of a query. The documents and the  queries are represented in a similar manner, so that document selection and ranking  can be formalized by a matching function that returns a retrieval status value (RSV) for  each document in the collection. Many of the Information Retrieval systems represent  document contents by a set of descriptors, called terms, belonging to a vocabulary V. ', 'parent': 1}, {'heading': 'Components of Information Retrieval/ IR Model ', 'level': 1, 'pgno': 4, 'children': [{'heading': ' Acquisition', 'level': 2, 'pgno': 5, 'children': [], 'content': '  In this step, the selection of documents and other objects from various web resources that consist of text-based documents takes place. The required data is collected by web crawlers and stored in the database. ', 'parent': 2}, {'heading': ' Representation', 'level': 2, 'pgno': 6, 'children': [], 'content': '  It consists of indexing that contains free-text terms, controlled vocabulary, manual & automatic techniques as well. example: Abstracting contains summarizing and Bibliographic description that contains author, title, sources, data, and metadata. ', 'parent': 2}, {'heading': ' File Organization', 'level': 2, 'pgno': 7, 'children': [], 'content': '  There are two types of file organization methods. i.e. Sequential : It contains documents by document data.   Inverted : It contains term by term, list of records under each term.  Combination  of both. ', 'parent': 2}, {'heading': ' Query', 'level': 2, 'pgno': 8, 'children': [], 'content': '  An IR process starts when a user enters a query into the system. Queries are formal statements of information needs, for example, search strings in web search engines. In information retrieval, a query does not uniquely identify a single object in the collection. Instead, several objects may match the query, perhaps with different degrees of relevancy. ', 'parent': 2}], 'content': '', 'parent': 2}, {'heading': 'User Interaction With Information Retrieval System ', 'level': 1, 'pgno': 9, 'children': [], 'content': 'The User Task:  The information first is supposed to be translated into a query by the  user. In the information retrieval system, there is a set of words that convey the  semantics of the information that is required whereas, in a data retrieval system, a  query expression is used to convey the constraints which are satisfied by the objects.  Example: A user wants to search for something but ends up searching with another  thing. This means that the user is browsing and not searching.', 'parent': 3}],
            src:'',
            index:0,
            ppt_path:'',
            // mcq:this.props.location.mcq,
            id:this.props.location.tid,
            main_heading:"<h1>",
            topic:0
        }
    }
    componentWillMount(){
      fetch('http://localhost:5000/get_tutorial_info', {
      method: 'POST',
      body:JSON.stringify({'tid':this.state.id}),
      headers: new Headers({
        "content-type": "application/json"
      })
    }).then((response) => {
      response.json().then((body) => {
        console.log(body);
        this.setState({ppt_path:"http://localhost:5000/return-files?pptpath="+body.ppt_path,src:"http://localhost:5000/return-files?pptpath="+body.pdf_path+"#page=1",hierarchy:body.subtopic_mapping});
        console.log(this.state);
    });
    })}
    openFullscreen(ev) {
        ev.preventDefault();
        // console.log(elem.parentNode.childNodes)
        // elem=elem.parentNode.childNodes[3];
        console.log("here");
        var elem=document.getElementById("button1");
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
          elem.msRequestFullscreen();
        }
      } 
    print(index){
        // var x=document.getElementById("button1");
        // console.log(x);
        // document.getElementById("myId").src="http://localhost:5000/return-files1?pptpath=D:/College/Capstone Project/Final/backend/Create-tutorials-from-text-file/scripts/ppt_trial.pdf#page=9";
        // var x=this.state.src.split("#")[0];
        // this.setState({src:x+"#page="+pgno.toString(),index:this.state.index+1})
        console.log(index);
        this.setState({topic:index,index:this.state.index+1})
        // document.getElementById("button1").contentDocument.location.reload(true);
    }
    check_children(children){
      for(var i=0;i<children.length;i++){
        if(children[i].heading[1]=="h")
          return false;
      }
      return true;
    }
    render(){
        const TreeRecursive = ({ data }) => {
            // loop through the data
            return data.map((item,index) => {
              // if its a file render <File />
              if (item["children"].length == 0 || this.check_children(item["children"])) {
                if(item["heading"][1]=="h"){
                return <MenuItem onClick={() => this.print(3)} style={{fontSize:"20px",color:"#f9f9f9d7"}}>{item["content"]}</MenuItem>;}
              }
              // if its a folder render <Folder />
              else {
                return (
                  <SubMenu title={item["content"]} onClick={() => this.print(item["pgno"])}  style={{fontSize:"20px",color:"#f9f9f9d7"}}>
                    <TreeRecursive data={item["children"].reverse()}/>
                  </SubMenu>
                );
              }
            });
          };
          // var { tutorial_id } = useParams();
        const Student=(<Link to={{pathname:"/student_assessments/", data:this.state.topic==this.state.hierarchy.length-1?this.state.hierarchy.length%2==0?((this.state.topic+1)/2|0)-1:((this.state.topic+1)/2|0):((this.state.topic+1)/2|0)-1, tid: this.state.id, topic:this.state.topic, topic_length:this.state.hierarchy.length}}><button  className="btn-secondary btn-lg button2">Next &raquo;</button></Link>);
    const teacher=<Link to={{pathname:"/assessments",tid:this.state.id}}><button  className="btn-secondary btn-lg" style={{color:"black"}}>View Assessment</button></Link>;
    if(this.state.hierarchy){
  return (
    
  	 <div class="row">
	     <div class="col-3">
	     <ProSidebar width="325px" toggled="true">
		<Menu iconShape="square" id="sidebar">
	<TreeRecursive data={this.state.hierarchy}/>
	</Menu>
	</ProSidebar>
	     </div> 
	     <div class="col-7"> 
               <center>
                   <br></br>
               <h5>
                 <button  className="btn-secondary btn-lg">
                   <a href={this.state.ppt_path} download style={{color: "black"}}>
                     Download PPT
                   </a>
                 </button>&nbsp;
                 {/* <Link to={{pathname:"/picture_gallery/"}}><button  className="btn-secondary btn-lg">
                     Picture gallery
                 </button></Link> */}
               </h5>
               <br></br>
      {/* <div class="embed-responsive embed-responsive-16by9">
	                        
	                       	
        <a  class="elem-fullscreen-link" onClick={this.openFullscreen} id="button">
            <span class="fa fa-arrows-alt" aria-hidden="true"></span>
            </a>
        <iframe class="embed-responsive-item elem-fullscreen" src={this.state.src} allowfullscreen="" width="10%" height="100%" id="button1" key={this.state.index} src={this.state.src} style={{margin:"0 auto"}}>
        </iframe>
        <h5 style={{color:"black"}}>Click here to {jwt_decode(localStorage.usertoken).identity.role==="student"?"take":"view"} assessments{jwt_decode(localStorage.usertoken).identity.role==="student"?student:teacher}</h5> 
        </div>
         */}
        
	      <hr/>
        </center>
        <Content key={this.state.index} heading={this.state.hierarchy[0]}></Content>
        <hr></hr>
        <button onClick={() => this.state.topic>0?this.print(this.state.topic-1):null} className="btn-secondary btn-lg button1">&laquo; Previous</button>
        <p style={{display:"inline"}} className="middle">{(this.state.topic+1)%2==0&&jwt_decode(localStorage.usertoken).identity.role==="student"?"Assessment coming up":null}</p>
        {jwt_decode(localStorage.usertoken).identity.role==="student" && ((this.state.topic+1)%2==0 || (this.state.topic==this.state.hierarchy.length-1))?(Student):(<button onClick={() => this.state.topic+1<this.state.hierarchy.length?this.print(this.state.topic+1):null} className="btn-secondary btn-lg button2">Next &raquo;</button>)}
        <br></br>
        <hr></hr>
        <br></br>
        <center><h5 style={{color:"black"}}>{jwt_decode(localStorage.usertoken).identity.role==="teacher"?null:null}  {jwt_decode(localStorage.usertoken).identity.role==="student"?null:teacher}</h5> </center>
    {/* <Iframe src={this.state.src}
        width="100%"
        height="100%"
        id="myId"
        className="myClassname"
        display="initial"
        position="relative"/> */}
	    </div>
        {/* <embed id="button1" src={this.state.src} allowfullscreen="" width="100%" height="100%" id="button1"></embed>
        </center></div> */}
	    <div class="col-2">
	    <br/>
	      <ul className='cards__items'>
            <CardItem
              src='http://i.ytimg.com/vi/BdhErO4a9XE/maxresdefault.jpg'
              text='Learn about the various events in PES University'
              path='https://events.pes.edu/'
            />
           </ul>
           <ul>
            <CardItem
              src='https://minutes.co/wp-content/uploads/2019/06/research-and-scholarship.jpg'
              text='Learn about the ongoing Research in PES University'
              path='https://research.pes.edu/patents/'
            />
           </ul>
           <ul>
            <CardItem
              src='https://news.pes.edu/Uploads/20190704%20103742_1.jpg'
              text='Be Updated with the current news in PES University'
              path='https://news.pes.edu/'
            />
          </ul>
	    </div>
	  </div>
  	)
}
else{
  return null;}
}
}

export default ppt;
import React,{Component} from 'react'
import './Upload.css';
import Tutorial from './Tutorial';
import jwt_decode from 'jwt-decode'
import Loader from 'react-loader-spinner';
class Upload extends Component{

  constructor(){
    super();
    this.state = {
        text1: '',
        summary1: '',
        mapping: {},
        ppt_path: '',
        fname: '',
        pdf_path: '',
        numPages: null, 
        pageNumber: 1,
        onsubmit:false,
        boolean_question: {},
        mcq:{},
        subtopic_mapping:[],
        filename:'',
        username:jwt_decode(localStorage.usertoken).identity.username,
        tutorial_id:0,
        tname:'',
        label:'',
        question_content:'',
        loading:false
     };

    this.handleUpload = this.handleUpload.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    console.log(jwt_decode(localStorage.usertoken).identity.username)
    
  }
 
  handleUpload(e){
    e.preventDefault();
    const fileInput = document.querySelector(
            "#file-js-example input[type=file]"
          );
    if (fileInput.files.length > 0) {
              const fileName = document.querySelector(
                "#file-js-example .file-name"
              );
              fileName.textContent = fileInput.files[0].name;
            };
  }

  handleSubmit(e){
    e.preventDefault();
    this.setState({loading:true});
    var x=document.getElementById("upload");
    x.src="https://cdn2.vectorstock.com/i/1000x1000/52/11/loading-icon-in-simple-style-vector-8445211.jpg";
    x.height="300px";
    const data = new FormData();
    data.append('Upload', this.uploadInput.files[0]);
    console.log(document.querySelector("input[name=\'tname\']").value)
    data.append('Tname', this.tname.value);
    data.append('Label',this.label.value);
    console.log(data);
    fetch('http://localhost:5000/submit', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ text1: body.text,  summary1: body.summary, mapping:body.mapping, fname:body.fname, filename:body.filename,tname:body.tname,label:body.label});
        console.log(this.state);
            fetch('http://localhost:5000/ppt', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: new Headers({
        "content-type": "application/json"
      }),
    }).then((response) => {
      response.json().then((body) => {
        console.log(body)
        this.setState({ ppt_path: body.ppt_path , pdf_path: body.pdf_path, subtopic_mapping:body.subtopic_mapping,tutorial_id:body.tutorial_id,question_content:body.question_content, page_mapping:body.page_mapping});
        console.log(this.state.ppt_path,this.state.pdf_path);
        console.log(this.state.question_content)
        fetch('http://localhost:5000/assessments', {
      method: 'POST',
      body:JSON.stringify({'data':this.state.question_content,'id':this.state.tutorial_id}),
      headers: new Headers({
        "content-type": "application/json"
      }),
    }).then((response) => {
      response.json().then((body) => {
        this.setState({mcq:body.mcq});
        console.log(this.state);
        this.setState({onsubmit:true});
    });
});
    
        // document.body.appendChild(pdf_preview);
        // document.getElementById("pdf_preview").src=this.state.pdf_path;
      });
    });
    });
});
  }
  render(){
    const Loadersymbol=(<h1>Your tutorial is being made!</h1>)
  return (
    <div className="upload">
      {!this.state.onsubmit &&(
      <main role="main">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css" />
    <div className="hero">
      <p className="is-size-3 has-text-black has-text-weight-bold has-text-centered">Upload any Document to get an instant
        Tutorial</p>
      <p className="is-size-4 has-text-weight-bold has-text-centered">You Know 📖, You Grow 🚀</p>
      <p className="is-size-5 has-text-black has-text-weight-medium has-text-centered"> Accepted Formats - PDF • TXT </p>
      </div>
      <br></br>
      {!this.state.loading?
      (<form onSubmit={this.handleSubmit}>
      <p className="is-size-5 has-text-black has-text-weight-medium has-text-centered">Name:  <input type="text" placeholder="Enter name of tutorial" name="tname" ref={(ref) => { this.tname = ref; }}/><br/></p><br></br>
      <p className="is-size-5 has-text-black has-text-weight-medium has-text-centered">Category: <input type="text" placeholder="Enter category of tutorial" name="label" ref={(ref) => { this.label = ref; }}/><br/></p>
    <div className="card has-text-centered">
    
    <img id="upload" src="https://cdn4.iconfinder.com/data/icons/files-and-folders-thinline-icons-set/144/File_PDF-512.png"
        alt="upload" height="300px"/>
        <div id="file-js-example" class="file has-name is-fullwidth">
          <label class="file-label">
            <input class="file-input" type="file" name="file" accept=".txt, application/pdf" onChange={this.handleUpload} ref={(ref) => { this.uploadInput = ref; }}/>
            <span class="file-cta">
              <span class="file-icon">
                <i class="fas fa-upload"></i>
              </span>
              <span class="file-label"> Choose a file… </span>
            </span>
            <span class="file-name"> No file uploaded </span>
          </label>
        </div>
        <button class="button has-text-centered is-large is-fullwidth is-dark">
          <span class="submit has-text-centered" type="submit" name="upload file">Submit</span>
          <span class="loading"><i class="fa fa-refresh"></i></span>
          <span class="check"><i class="fa fa-check"></i></span>
        </button>  
        </div>
      </form>):(<div><div
      style={{
        width: "100%",
        height: "100",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Loader type="Oval" color="#2BAD60" height="300" width="300" />
      <br></br>
      
    </div><p style={{fontSize:"35px"}}>Please wait while your tutorial is being made...</p></div>)}
      
  </main>)}
  {/* {!this.state.onsubmit && (this.state.loading && )} */}
  {this.state.onsubmit && (<Tutorial data={this.state}/>)}
    </div>
 
  );
    }
}

export default Upload;
import React from 'react';
import './tutorial.css';
import { Link, withRouter } from 'react-router-dom'
import Sidebar from '../Sidebar';
import ppt from './ppt';
class Tutorial extends React.Component {
  constructor(props) {
    super(props);

    this.state= props.data;
    console.log(this.state)

  }
  //then(res => res.text()).then(text => console.log(text));
  render() {
    return (
      // <div class="row">
	    // <div class="col-2">
      //   <Sidebar/>
      //   </div>
    <div className="container2">
      <br></br>
      <br></br>
    {/* style={{backgroundColor:"#8CC152"}}> */}
      {/* <form onSubmit={this.handleUploadImage}>
        <div>
          <input ref={(ref) => { this.uploadInput = ref; }} type="file" className="btn-secondary btn-lg"/>
        </div>
         <div>
          <input ref={(ref) => { this.fileName = ref; }} type="text" placeholder="Enter the desired name of file" />
        </div>
        <br />
        <div>
          <button className="btn-secondary btn-lg">Upload</button>
        </div>  */}

        <div className="heading">
          <div className="left-col-heading">
            <h1>Text</h1>
          </div>
          
          <div className="center-col-heading">
            <h1>Summary</h1>
          </div>
        </div>
        
        <div className="container1">
          <div className="left-col" id="text">
            {this.state.text1}
          </div>
          
          <div className="center-col" id="summary">
            {/* <span>List</span>
            <ul>
              Hello World
            </ul> */}
            {this.state.summary1}
          </div>
        </div>

      {/* </form> */}
      <br></br>
      <Link to={{pathname:"/ppt",pdf_path:this.state.pdf_path,mapping:this.state.subtopic_mapping,ppt_path:this.state.ppt_path,mcq:this.state.mcq,tid:this.state.tutorial_id}}>
      <button  className="btn-secondary btn-lg">Create Tutorial</button>
      {/* onClick={this.createPPT} */}
      </Link>
      <br/><br/>
      <a href={"http://localhost:5000/return-files?pptpath="+ this.state.ppt_path} id="download_link" download> </a>
      <br/>
      <embed id="embedpdf"></embed>
    </div>
    // </div>
    );
  }
  
}

export default Tutorial;
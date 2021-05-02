import React from 'react';
import './content.css';

class Content extends React.Component{
    constructor(props){
        super(props);
        this.state=props.heading;
    }
    render(){
        const utf8 = require('utf8');
        const Image_tag=({img_path})=>(<center><img src={img_path} height={"50%"} width={"50%"}></img></center>);
        const Content_data=({data}) =>(<div><p className={"class"+(data["heading"][1]=='h'?data["heading"].slice(2,data["heading"].length-1):'')}>{data["content"]}</p></div>);
        const TreeRecursive = ({ data }) => {
              if (data["children"].length == 0) {
                //console.log(data);
                if(data["heading"]!="<img>"){
                  return <Content_data data={data}/>
                }
                else{
                  console.log(data)
                  return <Image_tag img_path={"http://localhost:5000/return-files1?pptpath="+data["content"]}/>
                }
              }
              else {
                return (
                    <div>
                  <Content_data data={data}/>
                  <br></br>
                  {data["children"].map((item) => (
                    <TreeRecursive data={item} />))}
                </div>
                );
              }
            }
        return(
           <div className="container1" style={{fontSize:"24px"}}>
             {/* {console.log(this.state["audio_link"])} */}
             <audio controls src={"http://localhost:5000/return-files1?pptpath="+this.state["audio_link"]} type="audio/mpeg"></audio><TreeRecursive data={this.state}/></div> 

        )
    }
}
export default Content
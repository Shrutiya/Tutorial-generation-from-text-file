import React from 'react';

class Gallery extends React.Component{
    constructor(props){
        super(props);
        // this.get_pics=this.get_pics.bind(this);
        this.id=4;
        this.state={
            paths:[],
            imgs:[]
        };
    }
    componentDidMount(){
        console.log("hi")
        fetch('http://localhost:5000/picture-gallery', {
      method: 'POST',
      body:JSON.stringify({'id':this.id}),
      headers: new Headers({
        "content-type": "application/json"
      })
    }).then((response) => {
      response.json().then((body) => {
        this.setState({paths:body});
        var img=[];
        for(var i=0;i<this.state.paths.length;i++){
            var path="http://localhost:5000/return-files1?pptpath="+this.state.paths[i];
            img.push(<img src={path}></img>);
        }
        this.setState({imgs:img});
        });
    })
    }
    render(){
        return (<div>
            <h1>Picture Gallery</h1>
            {this.state.imgs}
        </div>)
    }
}

export default Gallery;
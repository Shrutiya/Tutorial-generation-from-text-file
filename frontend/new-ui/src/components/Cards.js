import React from 'react';
import './Cards.css';
import CardItem from './CardItem';
import { render } from '@testing-library/react';

class Cards extends React.Component {
  constructor(){
    super()
    this.state={
      tutorials:{},
      items:''
    }
  }
  componentDidMount() {
    fetch('http://localhost:5000/featured_tutorials', {
      method: 'GET',
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
        path={{pathname:"/ppt/"+this.state.tutorials[index]["id"],mapping:this.state.tutorials[index]["subtopic_mapping"],pdf_path:this.state.tutorials[index]["pdf_path"],ppt_path:this.state.tutorials[index]["ppt_path"],mcq:this.state.tutorials[index]["mcq"],tid:this.state.tutorials[index]["id"]}}
      />
      :false}
      {index+1<Object.keys(this.state.tutorials).length?
      <CardItem
        src={this.state.tutorials[index+1]['url']}
        text={this.state.tutorials[index+1]['name']}
        label={this.state.tutorials[index+1]['label']}
        path={{pathname:"/ppt/"+this.state.tutorials[index+1]["id"],mapping:this.state.tutorials[index+1]["subtopic_mapping"],pdf_path:this.state.tutorials[index+1]["pdf_path"],ppt_path:this.state.tutorials[index+1]["ppt_path"],mcq:this.state.tutorials[index+1]["mcq"],tid:this.state.tutorials[index+1]["id"]}}
      />
      :false}
      {index+2<Object.keys(this.state.tutorials).length?
      <CardItem
        src={this.state.tutorials[index+2]['url']}
        text={this.state.tutorials[index+2]['name']}
        label={this.state.tutorials[index+2]['label']}
        path={{pathname:"/ppt/"+this.state.tutorials[index+2]["id"],mapping:this.state.tutorials[index+2]["subtopic_mapping"],pdf_path:this.state.tutorials[index+2]["pdf_path"],ppt_path:this.state.tutorials[index+2]["ppt_path"],mcq:this.state.tutorials[index+2]["mcq"],tid:this.state.tutorials[index+2]["id"]}}
      />
      :false}
    </ul>)
    }
    this.setState({items:l});
        // this.setState({onsubmit:true});
        // console.log(this.state.items)
    });
  })
  }
render(){
  return (
    <div className='cards'>
      <h1>Check out some available Tutorials!!</h1>
      <div>
        <div className='cards__wrapper'>
          {this.state.items}
        </div>
      </div>
    </div>
  );
}
}

export default Cards;
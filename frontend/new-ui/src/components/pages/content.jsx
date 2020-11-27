import React from 'react';
import './content.css';

class Content extends React.Component{
    constructor(props){
        super(props);
        this.state=props.heading;
    }
    render(){
        const Content_data=({data}) =>(<div><p className={"class"+data["level"]}>{data["heading"]}</p>
        <p>{data["content"]}</p></div>);
        const TreeRecursive = ({ data }) => {
              if (data["children"].length == 0) {
                return <Content_data data={data}/>
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
           <div className="container1" style={{fontSize:"24px"}}> <TreeRecursive data={this.state}/></div>
        )
    }
}
export default Content
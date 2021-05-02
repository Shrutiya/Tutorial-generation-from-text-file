import React from 'react';
import './Products.css';
import CardItem from './CardItem';
import Tutorial from './Tutorial';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Profile from './Profile';
import Assessment from './Assessment';
import Upload from './Upload';
import StudentAssessment from './StudentAssessment';
import Feedback from './feedback';
export default function Products() {
  return (
  	 <div class="row">
	    <div class="col-2" id="hello">
	    <br/>
	      <ul className='cards__items'>
            <CardItem
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRZIEf2Jysct2G9UTHJvTY3aOk6HZdWutuy4A&usqp=CAU'
              text='Click here to know more about PES University'
              path='https://www.pes.edu/'
            />
           </ul>
           <ul>
            <CardItem
              src='https://www.fastweb.com/uploads/article_photo/photo/2036400/crop635w_3-benefits-of-pre-college-summer-programs.jpg'
              text='Learn about Programs in PES University'
              path='https://www.pes.edu/programs/'
            />
           </ul>
           <ul>
            <CardItem
              src='https://images.shiksha.com/mediadata/images/1579493357phpSyKONr_270x200.jpg'
              text='Learn about Campus Life in PES University'
              path='https://www.pes.edu/campus-life/'
            />
          </ul>
	    </div>
	    <div class="col-8">
      <center>
      <Switch>
          <Route path='/tutorial_gen' component={Upload} />
          <Route path='/profile' component={Profile} />
          <Route path='/assessments' component={Assessment} />
          <Route path='/student_assessments' component={StudentAssessment} />
          <Route path='/collect_feedback' component={Feedback} />
        </Switch>
	      <hr/>
        </center>
	    </div>
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
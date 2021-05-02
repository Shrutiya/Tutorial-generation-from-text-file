import React, {Component} from 'react';
import './SignUp.css';
import { register } from './UserFunctions'
import { render } from '@testing-library/react';
class SignUp extends Component{
  constructor() {
    super()
    this.state = {
      username: '',
      email: '',
      password: '',
      role: 'student',
      errors: {}
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onChange(e) {
    console.log([e.target.name], e.target.value)
    this.setState({ [e.target.name]: e.target.value })
  }
  onSubmit(e) {
    e.preventDefault()

    const newUser = {
      username: this.state.username,
      email: this.state.email,
      password: this.state.password,
      role: this.state.role
    }

    register(newUser).then(res => {
      this.props.history.push(`/login`)
    })
  }
    
  render(){
  return (
      <div className="hero-container">
      <video src='https://media.giphy.com/media/xUPGGu9zmB3gYjxzdC/giphy.mp4' autoPlay loop muted />
      <div className="jumbotron">
            <form noValidate onSubmit={this.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">Register!!</h1>
              <div className="form-group">
                <label htmlFor="name">First name</label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  placeholder="Enter your username"
                  value={this.state.username}
                  onChange={this.onChange}/>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter email"
                  value={this.state.email}
                  onChange={this.onChange}/>
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select className="form-control"
                  name="role" id="cars" placeholder="Select Role" value={this.state.role}
                  onChange={this.onChange}>
                    <option value="student" defaultChecked>Student(Subscriber)</option>
                  <option value="teacher">Teacher(Creator)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.onChange}                />
              </div>
              <button
                type="submit"
                className="btn btn-lg btn-primary btn-block"
              >
                Register!
              </button>
            </form>
          </div>
        </div>
    )
  }
}

export default SignUp
import React, { Component } from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types';
import './mention.scss'
import { SendIcon } from '../../mod-assets/svgComp';
import {contentModtranslator} from '../../Content/modLocalization'

export default class Mentions extends Component {

    constructor(props) {
        super(props)
        this.mentionBox = ''
        this.mentionList = ''
        this.initialMentionBoxPos = 0
        this.filteredUser = []
        this.commentBox = React.createRef()
        this.listPos = 0

        this.state = {
            mentionListOpen: true,
            mentionValue: "",
            cursorPosition: 0,
            isUserListOpen: false,
            filteredUserList: [],
            trigger: null // value would be @ and  ＠
        }
    }

    getCursorXY = (input, selectionPoint) => {
        const {
          offsetLeft: inputX,
          offsetTop: inputY,
        } = input
        // create a dummy element that will be a clone of our input
        const div = document.createElement('div')
        // get the computed style of the input and clone it onto the dummy element
        const copyStyle = getComputedStyle(input)
        for (const prop of copyStyle) {
          div.style[prop] = copyStyle[prop]
        }
        // we need a character that will replace whitespace when filling our dummy element if it's a single line <input/>
        const swap = '.'
        const inputValue = input.tagName === 'INPUT' ? input.value.replace(/ /g, swap) : input.value
        // set the div content to that of the textarea up until selection
        const textContent = inputValue.substr(0, selectionPoint)
        // set the text content of the dummy element div
        div.textContent = textContent
        if (input.tagName === 'TEXTAREA') div.style.height = 'auto'
        // if a single line input then the div needs to be single line and not break out like a text area
        if (input.tagName === 'INPUT') div.style.width = 'auto'
        // create a marker element to obtain caret position
        const span = document.createElement('span')
        // give the span the textContent of remaining content so that the recreated dummy element is as close as possible
        span.textContent = inputValue.substr(selectionPoint) || '.'
        // append the span marker to the div
        div.appendChild(span)
        // append the dummy element to the body
        document.body.appendChild(div)
        // get the marker position, this is the caret position top and left relative to the input
        const { offsetLeft: spanX, offsetTop: spanY } = span
        // lastly, remove that dummy element
        // NOTE:: can comment this out for debugging purposes if you want to see where that span is rendered
        document.body.removeChild(div)
        // return an object with the x and y of the caret. account for input positioning so that you don't need to wrap the input
        return {
          x: inputX + spanX,
          y: inputY + spanY,
        }
      }


      handleMentionChange = (event) => {
        let {value, selectionStart} = event.target
        let {trigger} = this.state
        if (!this.initialMentionBoxPos) {
          let {x, y} = this.getCursorXY(document.getElementById('mention-box'), selectionStart)
          this.initialMentionBoxPos = x
        }
        
        let textBeforeCursor = value.substr(0, selectionStart)
        let textAfterCursor = value.substr(selectionStart)
        let txtArr =  trigger && textBeforeCursor.split(trigger)
        let search = txtArr && txtArr.pop()

        let filteredUserList = this.props.userList.filter(u => {
          if (u && u.value) {
            let value = u.value.toLowerCase()
            if (value.startsWith(search && search.toLowerCase())){
              return u
            }
          }
        })

        if (filteredUserList.length) {
          this.setState({
            filteredUserList
          })
        } else {
          this.setState({
            filteredUserList: []
          })
        }

      
        this.setState({
          mentionValue: value,
          cursorPosition: selectionStart
        })
        this.props.onCommentChange && this.props.onCommentChange(value)
      }

      handleKeypress = (event) => {
        let {key} = event
        let {value, selectionStart} = event.target

        if (key == '@' || key == '＠') {
          this.setState({
            isUserListOpen: true,
            trigger: key
          })
          let {x, y} = this.getCursorXY(document.getElementById('mention-box'), selectionStart)
          let mentionList = document.getElementById("mention-list")
          
          mentionList.style.left = `${this.initialMentionBoxPos}px`
          mentionList.style.top = `${y}px`
          mentionList.style.zIndex = 1
          mentionList.style.display = 'block'
        }
        
      }
    
      mentionChange = (value) => {
        let {mentionValue, cursorPosition, trigger} = this.state
        let {label} = value
    
        let mentionList = document.getElementById("mention-list")
        mentionList.style.display = 'none'
    
        let textBeforeCursor = mentionValue.substr(0, cursorPosition)
        let textAfterCursor = mentionValue.substr(cursorPosition)

        this.props.getMentionedUser(label)
        this.commentBox.current.focus()

       
        this.setState({
          // mentionListOpen: false,
          mentionValue: textBeforeCursor.substr(0, textBeforeCursor.lastIndexOf(trigger)) + ` ${trigger}${label} ` + textAfterCursor
        })
      }

      handleClick = () => {
          let {mentionValue, trigger} = this.state
        this.props.getTextContent(mentionValue, trigger)
        if (!this.props.articleId) return
        this.setState({
            mentionValue: ''
        })
      }

      componentDidMount () {
        document.body.addEventListener('keydown', function (event) {
            if (event.keyCode == 27) {
              let mentionList = document.getElementById("mention-list")
              mentionList.style.zIndex = -1
              mentionList.style.display = 'none'
            }
          })
          this.mentionList = document.getElementsByClassName('mention-select')[0];
          
          let mentionList = document.getElementById('mention-list');
          document.addEventListener('click', function(event) {
            var isClickInside = mentionList.contains(event.target);
            if (!isClickInside) {
              mentionList.style.display = 'none';
            }
          });
      }
    render() {
        let {userList} = this.props
        let {mentionListOpen, mentionValue,isUserListOpen, filteredUserList} = this.state
        return (
            <>
                <div className="custom-mention-box">
                <div id="mention-list" className="mention-select" style={{display: isUserListOpen ? 'block' : 'none' }}>
                    <Select
                      options={filteredUserList.length > 0 ? filteredUserList :  userList}
                      value="null"
                      className="mention-custom-select"
                      classNamePrefix="mention"
                      menuIsOpen={mentionListOpen}
                      name=""
                      onChange={this.mentionChange}
                      placeholder={''}
                      style={{'display':'block'}}
                    />
                    </div>

                    <textarea
                        id="mention-box" 
                        value={mentionValue} 
                        onChange={this.handleMentionChange}
                        onKeyPress= {this.handleKeypress}
                        name="custom-mention" 
                        cols="30" rows="5"
                        ref={this.commentBox}
                        placeholder=  {contentModtranslator('ARTICLE_EDIT.USER_MENTION_PLACEHOLDER')}
                        className="mention-box-padding"
                        style={{'display':'block'}}
                       
                     >
                     </textarea>
                     <button className="post-comment" onClick={this.handleClick}><SendIcon/></button>
                </div>
            </>
        )
    }

    
}

import React from 'react';
import '../CSS/course_tag.css';
import starFilled from '../Icons/starFilled.svg';
import starEmpty from '../Icons/starEmpty.svg';
import tinycolor from "tinycolor2";

function CourseTag({
  data,
  onClick,
}) {

  const darkCreditColor = tinycolor(data.credit_color).darken(30).toString();
  const stars = Array(5).fill(0).map((_, index) => (
  <span key={index} className="star">
    {index < data.rating ? (
      <img className='star' src= {starFilled} alt="S" />
    ) : (
      <img src= {starEmpty} alt="E" />
    )}
  </span>
  ));

  return (
    <div className="course-tag" onClick={onClick}>

      <div className="header" style={{ backgroundColor: data.header_color }}>
        <img src={data.icon_url} alt="Course Icon" style={{ color: data.icon_color }} className="course-icon" />

        <div className="course-info">
            <div className="top-row">

            <h3 className="course-number"> {data.course_code}</h3>

            {data.credit_hours != 1 && <div className="tag-credits" style={{ backgroundColor: data.credit_color}}>
                {data.credit_hours} credits
            </div>}
            {data.credit_hours == 1 && <div className="tag-credits" style={{ backgroundColor: data.credit_color}}>
                {data.credit_hours} credit
            </div>}
            </div>

            <h4 className="course-name">{data.course_name}</h4>

        </div>

      </div>


      <div className="course-body">
            <div className='rating-text'>
                Rating
            </div>

        <div className="top-section">
            <div className="match">
            <p>{data.percent_match}% match</p>
            </div>

            <div className="rating">
                <div>
                    {stars}
                </div>
                {data.num_ratings != 0 && <span className='star-text'>(Out of {data.num_ratings} people)</span>}
                {data.num_ratings == 0 && <span className='star-text'>(Out of {data.num_ratings} person)</span>}
            </div>
        </div>

        {/* <span className='course-tag-text'>Course tags</span> */}

        <div className="tags">
          {data.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      </div>

    </div>
  );
}

export default CourseTag;
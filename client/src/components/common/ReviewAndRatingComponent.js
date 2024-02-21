import React, { useState } from 'react';
import './rating.css';

const ReviewAndRatingComponent = (props) => {

    const [selectedStar, setSelectedStar] = useState(0);
    const [ratingMessage, setRatingMessage] = useState('');
    const [chosenTags, setChosenTags] = useState([]);
    const [comment, setComment] = useState('');
    const [productId] = useState();
    const [submitted, setSubmitted] = useState(false);

    const handleStarHover = (value) => {
        const stars = Array.from(document.querySelectorAll('.rating-component .stars-box .star'));

        stars.forEach((star, index) => {
            if (index < value) {
                star.classList.add('hover');
            } else {
                star.classList.remove('hover');
            }
        });
    };
    const handleStarLeave = (value) => {
        const stars = Array.from(document.querySelectorAll('.rating-component .stars-box .star'));

        stars.forEach((star, index) => {
            star.classList.remove('hover');
        });
    };

    const handleStarClick = (value) => {
        const stars = Array.from(document.querySelectorAll('.rating-component .stars-box .star'));
        const rateValueInput = document.querySelector('.rating-component .starrate .ratevalue');
        const doneButton = document.querySelector('.button-box .done');

        const msg = value > 1 ? value : value;
        rateValueInput.value = msg;

        document.querySelector('.fa-smile-wink').style.display = 'block';
        doneButton.style.display = 'block';

        if (value === 5) {
            setComment("Sản phẩm tuyệt vời")
            doneButton.removeAttribute('disabled');
        } else {
            doneButton.setAttribute('disabled', 'true');
        }

        stars.forEach((star, index) => {
            star.classList.remove('selected');
            if (index < value) {
                star.classList.add('selected');
            }
        });
        var message = '';
        if (value == 1) {
            message = 'Poor';
        }
        else if (value == 2) {
            message = 'Too bad';
        }
        else if (value == 3) {
            message = 'Average quality';
        }
        else if (value == 4) {
            message = 'Nice';
        }
        else if (value == 5) {
            message = 'Very good quality';
        }
        setRatingMessage(message);
        document.querySelector('.status-msg').innerHTML = message;
        document.querySelectorAll('[data-tag-set]').forEach((tagSet) => tagSet.style.display = 'none');
        document.querySelector(`[data-tag-set="${value}"]`).style.display = 'block';

        setSelectedStar(value);
    };

    const handleTagClick = (tagSet) => {
        const choosedTagsLength = document.querySelectorAll('.feedback-tags .choosed').length;
        const doneButton = document.querySelector('.button-box .done');

        if (document.querySelector(`[data-tag-set="${tagSet}"]`).classList.contains('choosed')) {
            document.querySelector(`[data-tag-set="${tagSet}"]`).classList.remove('choosed');
            setChosenTags(chosenTags.filter(tag => tag !== tagSet.toString()));
        } else {
            document.querySelector(`[data-tag-set="${tagSet}"]`).classList.add('choosed');
            setChosenTags([...chosenTags, tagSet.toString()]);
            doneButton.removeAttribute('disabled');
        }

        if (choosedTagsLength <= 0) {
            doneButton.setAttribute('disabled', 'true');
        }
    };

    const handleComplimentClick = () => {
        document.querySelector('.fa-smile-wink').style.display = 'none';
    };

    const handleSubmit = () => {
        props.onComment(selectedStar, comment);
    };

    return (
        <div className="wrapper">
            <div className="master">
                <h1>Đánh giá và xếp hạng</h1>
                <h2>Trải nghiệm của bạn về sản phẩm của chúng tôi như thế nào?</h2>

                {/* Stars Component */}
                <div className="rating-component">
                    {/* ... other HTML code ... */}
                    <div className="status-msg">
                        <label>
                            <input
                                className="rating_msg"
                                type="hidden"
                                name="rating_msg"
                                defaultValue=""
                            />
                        </label>
                    </div>
                    <div className="stars-box">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <i
                                key={value}
                                className={`star fa fa-star ${value <= selectedStar ? 'selected' : ''}`}
                                title={`${value} stars`}
                                data-message={`Rating: ${value}`}
                                data-value={value}
                                onMouseOver={() => handleStarHover(value)}
                                onClick={() => handleStarClick(value)}
                                onMouseLeave={() => handleStarLeave(value)}
                            ></i>
                        ))}
                    </div>
                    <div className="starrate">
                        <label>
                            <input
                                className="ratevalue"
                                type="hidden"
                                name="rate_value"
                                defaultValue=""
                            />
                        </label>
                    </div>
                    {/* ... other HTML code ... */}
                </div>

                {/* Feedback Tags Component */}
                <div className="feedback-tags">
                    {/* ... other HTML code ... */}
                    <div className="tags-container" data-tag-set="1" onClick={() => handleTagClick(1)}>
                        <div className="question-tag">Tại sao trải nghiệm của bạn lại tệ đến thế?</div>
                    </div>
                    {/* ... other HTML code ... */}
                    <div className="tags-container" data-tag-set="2" onClick={() => handleTagClick(2)}>
                        <div className="question-tag">Tại sao trải nghiệm của bạn lại tệ đến thế?</div>
                    </div>
                    {/* ... other HTML code ... */}
                    <div className="tags-container" data-tag-set="3" onClick={() => handleTagClick(3)}>
                        <div className="question-tag">Tại sao trải nghiệm xếp hạng trung bình của bạn?</div>
                    </div>
                    {/* ... other HTML code ... */}
                    <div className="tags-container" data-tag-set="4" onClick={() => handleTagClick(4)}>
                        <div className="question-tag">Tại sao trải nghiệm của bạn lại tốt?</div>
                    </div>
                    {/* ... other HTML code ... */}
                    <div className="tags-container" data-tag-set="5">
                        <div className="make-compliment">
                            <div className="compliment-container" onClick={handleComplimentClick}>
                                Đưa ra lời khen ngợi
                                <i className="far fa-smile-wink"></i>
                            </div>
                        </div>
                    </div>

                    {/* ... other HTML code ... */}
                    <div className="tags-box">
                        <input
                            type="text"
                            className="tag form-control"
                            name="comment"
                            id="inlineFormInputName"
                            placeholder="Vui lòng nhập đánh giá của bạn"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <input type="hidden" name="product_id" value={productId} />
                    </div>
                </div>

                {/* Button Box Component */}
                <div className="button-box">
                    <input
                        type="submit"
                        className="done btn btn-warning"
                        disabled={selectedStar !== 5 && comment === ""}
                        value="Đánh giá"
                        onClick={handleSubmit}
                    />
                </div>

                {/* Submitted Box Component */}
                <div className="submited-box">
                    <div className="loader"></div>
                    <div className="success-message">Thank you!</div>
                </div>
            </div>
        </div>

    );
};

export default ReviewAndRatingComponent;

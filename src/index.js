import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';

let imagesDate = require('./imagesDate.json');

imagesDate=(function genImageUrl(imagesDateArr) {
    for (let i = 0,j=imagesDateArr.length; i < j ;  i++) {
        const singleImageDate = imagesDateArr[i];
        singleImageDate.imageUrl =require('./imgaes/'+singleImageDate.fileName);
        imagesDateArr[i]=singleImageDate; 
    }
    return imagesDateArr;    
})(imagesDate);

class ReactGallery extends React.Component{
    render(){
        return (
            <div>
                <section className="stage">
                    <section className="img-sec"></section>
                    <nav className="controller-nav"></nav>
                </section>
            </div>
        );
    }
}


ReactDOM.render(
    <ReactGallery/>, document.getElementById('root'));
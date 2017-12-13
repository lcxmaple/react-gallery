/*
 * 基于慕课网materliu的React实战--打造画廊应用课程编写
 * 将原来的环境替换为React团队官方的create-react-app脚手架搭建
 * 使用的React版本为16.0.0，以及ES6语法编写，所写代码均按照React16.0.0版本以后的规范编写
*/
import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
//图片信息转换URL路径
let imagesDate = require('./imagesDate.json');

imagesDate = (function genImageUrl(imagesDateArr) {
    for (let i = 0,j=imagesDateArr.length; i < j ;  i++) {
        const singleImageDate = imagesDateArr[i];
        singleImageDate.imageUrl =require('./imgaes/'+singleImageDate.fileName);
        imagesDateArr[i]=singleImageDate; 
    }
    return imagesDateArr;    
})(imagesDate);

//取两个数区间内的随机值
function getRangeRandom(low,high) {
    return Math.ceil(Math.random() * (high-low) + low);    
}

class ImgFigure extends React.Component{
    render(){

        let styleObj = {};

        //如果props属性中指定了这张图的位置，则使用
        if(this.props.arrange.pos){
            styleObj = this.props.arrange.pos;
        }

        return (
            <div>
                <figure className="img-figure" style={styleObj}>
                    <img src={this.props.date.imageUrl} alt={this.props.date.title}/>
                    <figcaption>
                        <h2 className="img-title">{this.props.date.title}</h2>
                    </figcaption>
                </figure>
            </div>
        );
    }
}


class ReactGallery extends React.Component{
    constructor(props){
        super(props);
        this.Constant={
            centerPos:{
                left:0,
                right:0
            },
            hPosRange : {  //水平方向取值范围（X坐标）
                leftSecX:[0,0],
                rightSecX:[0,0],
                y:[0,0]
            },
            vPosRange : {  //垂直方向取值范围（y坐标），只有中间上方显示图片，所以不需要中心下方的取值范围
                x:[0,0],
                topY:[0,0]
            }

        };
        this.state = {
            imgsArrangeArr: [
                // {
                //     pos : {
                //         left : '0',
                //         top : '0'
                //     }
                // }
            ]
        };
    }
    /*
     * 重新排布图片
     * @param centerIndex 指定居中哪个图片
     */ 
    rearrange(centerIndex){
        let imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSecX = hPosRange.leftSecX,
            hPosRangeRightSecX = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeTopY = vPosRange.topY,
            vPosRangeX = vPosRange.x,
            
            imgsArrangeTopArr =[],
            topImgNum = Math.ceil(Math.random() * 2),  //取一个或者不取
            topImgSpliceIndex = 0,
            
            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

        //首先居中 centerIndex 图片
        imgsArrangeCenterArr[0].pos = centerPos;
        
        //取出要布局上侧图片的状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

        //布局位于上侧的图片
        imgsArrangeTopArr.forEach((value,index) => 
            imgsArrangeTopArr[index].pos = {
                top: getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
                left: getRangeRandom(vPosRangeX[0],vPosRangeX[1])
            }
        );

        //布局左右两侧的图片
        for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
            let hPosRangeLORX = null;
            
            //前半部分布局左边，后半部分布局右边
            if(i < k){
                hPosRangeLORX = hPosRangeLeftSecX;
            }else{
                hPosRangeLORX = hPosRangeRightSecX;
            }
            
            imgsArrangeArr[i].pos = {
                top : getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
                left : getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
            };
        }

        if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
            imgsArrangeArr.splice(topImgSpliceIndex, 0,imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0 ,imgsArrangeCenterArr[0]);
        
        this.setState({
            imgsArrangeArr :imgsArrangeArr
        });
    } 


    //为图片分配位置
    componentDidMount(){
        //获取平台的大小
        let stageDOM = this.stage,
            stageW = stageDOM.scrollWidth,
            stageH = stageDOM.scrollHeight,
            halfStageW = Math.ceil(stageW / 2),
            halfStageH = Math.ceil(stageH / 2);
        //获取imgFigure的大小
        let imgFigureDOM = ReactDOM.findDOMNode(this.imgFigure0).firstChild,
            imgW = imgFigureDOM.scrollWidth,
            imgH = imgFigureDOM.scrollHeight,
            halfImgW = Math.ceil(imgW / 2),
            halfImgH = Math.ceil(imgH / 2);
        //计算中心图片的位置
        this.Constant.centerPos = {
            left:halfStageW -halfImgW,
            top :halfStageH -halfImgH
        };

        //计算左侧，右侧图片排布的取值范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;
        
        //计算上侧图片排布的取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;

        this.rearrange(0);
    }

    render(){
        let controllerUntils =[],
            imgFigures =[];

        imagesDate.forEach((value,index) => {
            if(!this.state.imgsArrangeArr[index]){
                this.state.imgsArrangeArr[index] = {
                    pos :{
                        left : 0,
                        top : 0
                    }
                };
            }
            imgFigures.push(<ImgFigure date={value} key={'imgFigure:'+index} ref={input => this['imgFigure' + index] = input} 
                arrange={this.state.imgsArrangeArr[index]}/>);
        });    
        return (
            <div>
                <section className="stage" ref={input => this.stage = input}>
                    <section className="img-sec">{imgFigures}</section>
                    <nav className="controller-nav">{controllerUntils}</nav>
                </section>
            </div>
        );
    }
}


ReactDOM.render(
    <ReactGallery/>, document.getElementById('root'));
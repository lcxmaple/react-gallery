/*
 * 基于慕课网materliu的React实战--打造画廊应用课程编写
 * 将原来的环境替换为React团队官方的create-react-app脚手架搭建
 * 使用的React版本为16.0.0，以及ES6语法编写，所写代码尽可能的按照React16.0.0版本以后的规范重新编写
 */
import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
//图片信息转换URL路径
let imagesDate = require('./imagesDate.json');

imagesDate = (function genImageUrl(imagesDateArr) {
    for (let i = 0,j=imagesDateArr.length; i < j ;  i++) {
        const singleImageDate = imagesDateArr[i];
        singleImageDate.imageUrl = require('./imgaes/'+singleImageDate.fileName);
        imagesDateArr[i] = singleImageDate; 
    }
    return imagesDateArr;    
})(imagesDate);

//取两个数区间内的随机值
function getRangeRandom(low,high) {
    return Math.ceil(Math.random() * (high-low) + low);    
}

//随机旋转30度
function get30DegRandom() {
    return ((Math.random() > 0.5?'' : '-')+Math.ceil(Math.random() * 30));
}

//深克隆对象方法
function cloneObj(obj){
    var newObj = {};
    if (obj instanceof Array) {
        newObj = [];
    }
    for (var key in obj) {
        var val = obj[key];
        // newObj[key] = typeof val === 'object' ? arguments.callee(val) : val;
        // //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。
        newObj[key] = typeof val === 'object'
            ? cloneObj(val)
            : val;
    }
    return newObj;
}

class ImgFigure extends React.Component{
    constructor(props){
        super(props);
        this.handleClick =this.handleClick.bind(this);
    }
    /*
     * imgFigure的点击处理函数
     */ 
    handleClick(e){
        if(this.props.arrange.isCenter){
            this.props.inverse();
        }else{
            this.props.center();
        }
        e.stopPropagation();
        e.preventDefault();
    }
    
    render(){
        /*
         * 踩坑点1  原课程中 style = this.props.arrange.pos是浅克隆，所以styleObj对象的属性只是this.props.arrange.pos的一个索引
         *     在第一次给styleObj添加了旋转角度属性之后，再次触发handleClick事件处理函数，会触发setstate重新渲染页面，此时再次执行
         *     旋转属性赋值操作，会导致react报错MozTransform属性是只读的，无法修改。
         *     修复方法：将浅克隆换为深克隆（可能会加重浏览器负担）
         */    

        let styleObj = {};

        //如果props属性中指定了这张图的位置，则使用
        if(this.props.arrange.pos){
            styleObj = cloneObj(this.props.arrange.pos);   //fix 将浅克隆换成深克隆
        }
        //如果图片的旋转角度不为0，则添加旋转角度   
        if(this.props.arrange.rotate){
            (['MozTransform', 'msTransform', 'WebkitTransform', 'transform']).forEach(value => {
                styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
            });
        }

        if(this.props.arrange.isCenter){
            styleObj.zIndex = 11;
        }

        let imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse? ' is-inverse':'';

        return (
            <div>
                <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
                    <img src={this.props.date.imageUrl} alt={this.props.date.title}/>
                    <figcaption>
                        <h2 className="img-title">{this.props.date.title}</h2>
                        <div className="img-back" onClick={this.handleClick}>
                            <p>
                                {this.props.date.desc}
                            </p>   
                        </div>
                    </figcaption>
                </figure>
            </div>
        );
    }
}

class ControllerUnit extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this
            .handleClick
            .bind(this);
    }

    handleClick(e) {
        //如果点中的是选中态的图片，则翻转，否则居中
        if(this.props.arrange.isCenter){
            this.props.inverse();
        }else{
            this.props.center();
        }
        e.preventDefault();
        e.stopPropagation();   
    }

    render() {
        let controllerUnitClassName = 'controller-unit';
        // 如果对应图片居中，则显示居中态
        if(this.props.arrange.isCenter){
            controllerUnitClassName += ' is-center';
            // 如果对应图片翻转，则显示翻转态
            if(this.props.arrange.isInverse){
                controllerUnitClassName += ' is-inverse';
            }
        }
        return (
            <span className={controllerUnitClassName} onClick={this.handleClick}></span>
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
                //     },
                //     rotate : 0,  //旋转角度
                //     isInverse : false  //正反面
                //     isCenter : false    //是否居中
                // }
            ]
        };
    }
    /*
     * 翻转图片
     * @param index 输入当前被inverse操作的图片的index值
     * @return {Function} 这是一个闭包函数，里面是真正待执行的函数
     */
    inverse(index){
        return () =>{
            let imgsArrangeArr = this.state.imgsArrangeArr;
            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

            this.setState({
                imgsArrangeArr :imgsArrangeArr
            });
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
            topImgNum = Math.floor(Math.random() * 2),  //取一个或者不取
            topImgSpliceIndex = 0,
            
            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

        //首先居中 centerIndex 图片,中心 centerIndex 的图片不需要旋转
        imgsArrangeCenterArr[0]={
            pos:centerPos,
            rotate:0,
            isCenter:true
        }; 
        
        //取出要布局上侧图片的状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

        //布局位于上侧的图片
        imgsArrangeTopArr.forEach((value,index) => 
            imgsArrangeTopArr[index] = {
                pos : {
                    top: getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
                    left: getRangeRandom(vPosRangeX[0],vPosRangeX[1])
                },
                rotate : get30DegRandom(),
                isCenter:false
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
            
            imgsArrangeArr[i]={
                pos : {
                    top : getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
                    left : getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
                },
                rotate : get30DegRandom(),
                isCenter : false
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

    /*
     * 利用rearrange 函数，居中对应index图片
     * @param index 需要被居中图片的index值
     * @return {Function}
     */
    center(index){
        return () =>this.rearrange(index);
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
        let controllerUnits =[],
            imgFigures =[];

        imagesDate.forEach((value,index) => {
            if(!this.state.imgsArrangeArr[index]){
                this.state.imgsArrangeArr[index] = {
                    pos :{
                        left : 0,
                        top : 0
                    },
                    rotate : 0,
                    isInverse : false,
                    isCenter : false,
                };
            }
            imgFigures.push(<ImgFigure date={value} key={'imgFigure:'+index} ref={input => this['imgFigure' + index] = input} 
                arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
            controllerUnits.push(<ControllerUnit key={'controller:'+index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
        });    
        return (
            <div>
                <section className="stage" ref={input => this.stage = input}>
                    <section className="img-sec">{imgFigures}</section>
                    <nav className="controller-nav">{controllerUnits}</nav>
                </section>
            </div>
        );
    }
}


ReactDOM.render(
    <ReactGallery/>, document.getElementById('root'));
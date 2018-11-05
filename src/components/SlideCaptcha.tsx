/// <reference path='../../types/global.d.ts'/>

import * as React from 'react';
import './styles/index.less';

enum validateStatus{
  init = 0,
  success = 1,
  error = -1,
}

type robotValidateConfig =  {
  offsetY: number,
  handler: () => any,
};

interface IProps {
  readonly puzzleUrl: string;
  readonly bgUrl: string;
  readonly onRequest: (validateValue: number, validatedSuccess: any, validatedFail?: any) => void;
  readonly slidedImage?: any;
  readonly slidedImageSuccess?: any;
  readonly slidedImageError?: any;
  readonly containerClassName?: string;
  readonly style?: object;
  readonly tipsText?: string;
  readonly robotValidate?: robotValidateConfig
}

interface IState {
  originX: number;
  offsetX: number;
  originY: number;
  totalY: number;
  validated: validateStatus;
  isMoving: boolean;
  isTouchEndSpan: boolean;
}

class SlideCaptcha extends React.Component<IProps, IState>{
  state: IState = {
    originX: 0,
    offsetX: 0,
    originY: 0,
    totalY: 0,
    validated: validateStatus.init,
    isMoving: false,
    isTouchEndSpan: false,
  };
  constructor(props: IProps) {
    super(props);
  }

  componentDidMount() {
    setTimeout(() => {
      this.maxSlidedWidth = this.ctrlWidth.clientWidth - this.sliderWidth.clientWidth;
    }, 0);
  }

  private maxSlidedWidth: number = 0;
  private ctrlWidth: any = null;
  private sliderWidth: any = null;

  private getClientX = (e): number => {
    if (e.type.indexOf('mouse') > -1) {
      return e.clientX;
    }
    if (e.type.indexOf('touch') > -1) {
      return e.touches[0].clientX;
    }
  };

  private getClientY = (e): number => {
    if (e.type.indexOf('mouse') > -1) {
      return e.clientY;
    }
    if (e.type.indexOf('touch') > -1) {
      return e.touches[0].clientY;
    }
  };

  private move = (e): void => {
    const clientX = this.getClientX(e);
    const clientY = this.getClientY(e);
    let offsetX = clientX - this.state.originX;
    let offsetY = Math.abs(clientY - this.state.originY);
    let totalY = this.state.totalY + offsetY;
    if (offsetX > 0) {
      if (offsetX > this.maxSlidedWidth) {
        // 超过最大移动范围，按极限值算
        offsetX = this.maxSlidedWidth;
      }
      this.setState({
        offsetX,
        totalY,
        // isMoving: true,
      });
    }
  };

  public validatedSuccess = (callback: () => any):void => {
    this.setState({
      validated: validateStatus.success,
    }, callback());

  };

  public validatedFail = (callback: () => any): any => {
    this.setState({
      validated: validateStatus.error,
    }, callback());
  };

  private handleTouchStart = (e): void => {
    e.preventDefault();
    this.setState({
      originX: this.getClientX(e),
      originY: this.getClientY(e),
    });
  };

  private handleTouchMove = (e): void => {
    e.preventDefault();
    this.move(e);
    this.setState({
      // offsetX,
      isMoving: true,
    });
  };

  private handleTouchEnd = (): void => {
    if(this.state.totalY <  (this.props.robotValidate && this.props.robotValidate.offsetY || 0) ) {
      this.setState({
        offsetX: 0,
        originX: 0,
        originY: 0,
        totalY: 0,
        isTouchEndSpan: false,
        isMoving: false,
        validated: validateStatus.error,
      }, () => {
        this.props.robotValidate && this.props.robotValidate.handler ? this.props.robotValidate.handler() : alert('请重试');
      });
      return;
    }

    if (this.state.offsetX > 0) {
      const validateValue = this.state.offsetX / this.maxSlidedWidth;
      this.setState({
        isTouchEndSpan: true,
        isMoving: false,
      });
      if (this.props.onRequest) {
        this.props.onRequest(validateValue, this.validatedSuccess, this.validatedFail);
      }
      setTimeout(() => {
        this.setState({
          offsetX: 0,
          originX: 0,
          originY: 0,
          totalY: 0,
          isTouchEndSpan: false,
          isMoving: false,
          validated: validateStatus.init,
        });
      }, 500);
    } else {
      this.setState({
        isTouchEndSpan: false,
        isMoving: false,
        offsetX: 0,
        originX: 0,
        originY: 0,
        totalY: 0,
        validated: validateStatus.init,
      });
    }
  };

  renderImage = ():any => {
    const slidedImageValue = this.props.slidedImage || '>';
    const slidedImageSuccessValue = this.props.slidedImageSuccess || '>';
    const slidedImageErrorValue = this.props.slidedImageError || 'x';
    return { slidedImageValue, slidedImageSuccessValue, slidedImageErrorValue };
  };

  renderCtrlClassName = (slidedImage, slidedImageSuccess, slidedImageError) => {
    let ctrlClassName;
    let slidedImageValue = slidedImage;
    if (this.state.isMoving) {
      ctrlClassName = 'slider-moving';
    } else {
      if (this.state.isTouchEndSpan) {
        if (this.state.validated === validateStatus.success) {
          ctrlClassName = 'slider-end slider-success';
          slidedImageValue = slidedImageSuccess;
        } else if (this.state.validated === validateStatus.error) {
          ctrlClassName = 'slider-end slider-error';
          slidedImageValue = slidedImageError;
        } else {
          ctrlClassName = 'slider-moving';
        }
      } else {
        ctrlClassName = '';
      }
    }
    return { ctrlClassName, slidedImage: slidedImageValue };
  };

  handlerMouseDown = (e) => {
    e.preventDefault();
    this.setState({
      originX: this.getClientX(e),
      originY: this.getClientY(e),
      isMoving: true,
    });
  };

  handlerMouseMove = (e) => {
    e.preventDefault();
    if (this.state.isMoving) {
      this.move(e);
    }
  };

  handlerMouseUp = (e) => {
    e.preventDefault();
    this.setState({
      isMoving: false,
    });
    this.handleTouchEnd();
  };

  render() {
    const {
      slidedImageValue, slidedImageSuccessValue, slidedImageErrorValue,
    } = this.renderImage();

    const { ctrlClassName, slidedImage } = this.renderCtrlClassName(
      slidedImageValue,
      slidedImageSuccessValue,
      slidedImageErrorValue,
    );
    return(
      <div>
        <div
          className={
            `slideCaptchaContainer ${this.props.containerClassName ?
              this.props.containerClassName : ''}`
          }
          style={this.props.style || {} }
          onMouseMove={this.handlerMouseMove}
          onMouseUp={this.handlerMouseUp}
        >
          <div className="panel">
            <img src={this.props.bgUrl} className="bgImg" />
            <img
                src={this.props.puzzleUrl}
                className="puzzleImg"
                style={{ left: `${this.state.offsetX}px` }}
            />
          </div>
          <div
            className={`control ${ctrlClassName ? ctrlClassName : ''}`}
            ref={(el) => { this.ctrlWidth = el; } }
          >
            <div className="slided" style={{ width: `${this.state.offsetX}px` }} />
            <div className="slider"
                 ref={(el) => { this.sliderWidth = el; }}
                 style={{ left: `${this.state.offsetX}px` }}
                 onTouchStart={this.handleTouchStart}
                 onTouchMove={this.handleTouchMove}
                 onTouchEnd={this.handleTouchEnd}
                 onMouseDown={this.handlerMouseDown}
            >
              {slidedImage}
            </div>
            <div className="tips">
              <span>
                {this.props.tipsText || '向右滑动滑块填充拼图'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SlideCaptcha;

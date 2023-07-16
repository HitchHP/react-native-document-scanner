import React from 'react'
import {
  DeviceEventEmitter,
  findNodeHandle,
  NativeModules,
  Platform,
  requireNativeComponent,
  ViewStyle } from 'react-native'

const RNPdfScanner = requireNativeComponent('RNPdfScanner')
const ScannerManager: any = NativeModules.RNPdfScannerManager

export interface PictureTaken {
  rectangleCoordinates?: object;
  croppedImage: string;
  initialImage: string;
  width: number;
  height: number;
}

/**
 * TODO: Change to something like this
interface PictureTaken {
  uri: string;
  base64?: string;
  width?: number; // modify to get it
  height?: number; // modify to get it
  rectangleCoordinates?: object;
  initial: {
    uri: string;
    base64?: string;
    width: number; // modify to get it
    height: number; // modify to get it
  };
}
 */

interface PdfScannerProps {
  onPictureTaken?: (event: any) => void;
  onRectangleDetect?: (event: any) => void;
  onProcessing?: () => void;
  quality?: number;
  overlayColor?: number | string;
  enableTorch?: boolean;
  useFrontCam?: boolean;
  saturation?: number;
  brightness?: number;
  contrast?: number;
  detectionCountBeforeCapture?: number;
  durationBetweenCaptures?: number;
  detectionRefreshRateInMS?: number;
  documentAnimation?: boolean;
  noGrayScale?: boolean;
  manualOnly?: boolean;
  style?: ViewStyle;
  useBase64?: boolean;
  saveInAppDocument?: boolean;
  captureMultiple?: boolean;
}

class PdfScanner extends React.Component<PdfScannerProps> {
  sendOnPictureTakenEvent (event: any) {
    if (!this.props.onPictureTaken) return null
    return this.props.onPictureTaken(event.nativeEvent)
  }

  sendOnRectangleDetectEvent (event: any) {
    if (!this.props.onRectangleDetect) return null
    return this.props.onRectangleDetect(event.nativeEvent)
  }

  getImageQuality () {
    if (!this.props.quality) return 0.8
    if (this.props.quality > 1) return 1
    if (this.props.quality < 0.1) return 0.1
    return this.props.quality
  }

  _pictureTakenListener: any = null;
  _processingChangeListener: any = null;

  componentDidMount () {
    if (Platform.OS === 'android') {
      const { onPictureTaken, onProcessing } = this.props
      if (onPictureTaken) this._pictureTakenListener = DeviceEventEmitter.addListener('onPictureTaken', onPictureTaken)
      if (onProcessing) this._processingChangeListener = DeviceEventEmitter.addListener('onProcessingChange', onProcessing)
    }
  }

  componentDidUpdate (prevProps: PdfScannerProps) {
    if (Platform.OS === 'android') {
      if (this.props.onPictureTaken !== prevProps.onPictureTaken) {
        if (this._pictureTakenListener !== null) {
          this._pictureTakenListener.remove()
          this._pictureTakenListener = null
        }
        if (this.props.onPictureTaken) {
          this._pictureTakenListener = DeviceEventEmitter.addListener('onPictureTaken', this.props.onPictureTaken)
        }
      }
      if (this.props.onProcessing !== prevProps.onProcessing) {
        if (this._processingChangeListener !== null) {
          this._processingChangeListener.remove()
          this._processingChangeListener = null
        }
        if (this.props.onProcessing) {
          this._processingChangeListener = DeviceEventEmitter.addListener('onProcessingChange', this.props.onProcessing)
        }
      }
    }
  }

  componentWillUnmount () {
    if (Platform.OS === 'android') {
      if (this._pictureTakenListener !== null) {
        this._pictureTakenListener.remove()
        this._pictureTakenListener = null
      }
      if (this._processingChangeListener !== null) {
        this._processingChangeListener.remove()
        this._processingChangeListener = null
      }
    }
  }

  capture () {
    if (this._scannerHandle) {
      ScannerManager.capture(this._scannerHandle)
    }
  }

  _scannerRef: any = null;
  _scannerHandle: number | null = null;
  _setReference = (ref: any) => {
    if (ref) {
      this._scannerRef = ref
      this._scannerHandle = findNodeHandle(ref)
    } else {
      this._scannerRef = null
      this._scannerHandle = null
    }
  };

  render () {
    return (
      <RNPdfScanner
        ref={this._setReference}
        {...this.props}
        onPictureTaken={this.sendOnPictureTakenEvent.bind(this)}
        onRectangleDetect={this.sendOnRectangleDetectEvent.bind(this)}
        useFrontCam={this.props.useFrontCam || false}
        brightness={this.props.brightness || 0}
        saturation={this.props.saturation || 1}
        contrast={this.props.contrast || 1}
        quality={this.getImageQuality()}
        detectionCountBeforeCapture={this.props.detectionCountBeforeCapture || 5}
        durationBetweenCaptures={this.props.durationBetweenCaptures || 0}
        detectionRefreshRateInMS={this.props.detectionRefreshRateInMS || 50}
      />
    )
  }
}

export default PdfScanner

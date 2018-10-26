import axios from 'axios';
import { Activity, CardAction, Message} from 'botframework-directlinejs';
import * as React from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { getAvailableTimes } from './getAvailableTimes';
import { ChatState } from './Store';
import { ChatActions, sendFiles , sendMessage } from './Store';

export interface Node {
    node_type: string;
    upload_url: string;
    conversation_id: string;
    node_id: number;
}

interface FileUploadProps {
    node: Node;
    fileSelected: (inputStatus: boolean) => void;
    sendMessage: (inputText: any) => void;
    sendFiles: (files: FileList) => void;
    gid: string;
}

export interface FileUploadState {
    files: any;
    uploadPhase: string;
    isUploading: boolean;
    signedUrl: string;
}

/**
 * File Upload card which renders in response to node of types 'file'
 * Used for file upload
 */
class FileUpload extends React.Component<FileUploadProps, FileUploadState> {
    constructor(props: FileUploadProps) {
        super(props);

        this.state = {
            files: [],
            uploadPhase: 'open',
            isUploading: false,
            signedUrl: null
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    removeFile = () => {
        this.setState({
            files: [],
            uploadPhase: 'open'
        });
    }

    private handleKeyDown =  (e: React.KeyboardEvent<HTMLInputElement>): any => {
        if (this.state.uploadPhase === 'open') { return; }
        if (this.state.uploadPhase === 'error') {
            this.setState({uploadPhase: 'open'});
            return;
        }
        if (e.key === 'Enter') {
            this.submitFiles();
            // this.props.sendFiles(this.state.files);
            document.removeEventListener('keypress', this.handleKeyDown.bind(this));
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
      }

    handleSkipFile(e: React.MouseEvent<HTMLDivElement>) {
        this.props.sendMessage('SKIP_UPLOAD');
    }

    getSignedUrl = (data: any) => {
        return new Promise((resolve, reject) => {
            if (this.state.signedUrl) {
                resolve({s3Url: this.state.signedUrl});
            } else {
                axios.post(this.props.gid + '/api/v1/nodes/presigned_url_for_node', data)
                .then((result: any) => {
                    console.log(result);
                    if (result.data.success) {
                        const signedUrl = result.data.url;
                        this.setState({signedUrl});
                        resolve({s3Url: this.state.signedUrl});
                    } else {
                        reject('Request failed');
                    }
                }).catch(err => {
                    reject('Request failed');
                });
            }

        });
    }

    submitFiles = () => {
        this.setState({isUploading: true});
        this.props.fileSelected(true);
        console.log(this.props);

        const file = this.state.files[0];
        const dataToGetSignedUrl = {
            node_id: this.props.node.node_id,
            content_tye: file.type,
            msft_conversation_id: this.props.node.conversation_id
        };

        this.getSignedUrl(dataToGetSignedUrl).then((result: any) => {
                const options = {
                  headers: {
                    'Content-Type': file.type
                  }
                };

                return axios.put(result.s3Url, file, options);
            }).then((result: any) => {
                if (result.status === 200) {
                  this.props.fileSelected(false);
                  this.setState({isUploading: false, uploadPhase: 'success'});

                  this.props.sendMessage(this.state.signedUrl.split('?')[0]);
                } else {
                    throw Error('Something went wrong. Try again.');
                }
            }).catch(err => {
                this.props.fileSelected(false);
                this.setState({isUploading: false, uploadPhase: 'error'});
                // console.log('error', err);
                this.props.sendMessage('Docs not uploaded successfully.');
              });
        }

    clickToSubmitFile(e: React.MouseEvent<HTMLDivElement>) {
        if (this.state.uploadPhase !== 'preview') { return; }
        this.submitFiles();
        // this.props.submitDate();
        // this.props.sendMessage(this.state.files);
        document.removeEventListener('keypress', this.handleKeyDown.bind(this));

        e.stopPropagation();
    }

    clickToRetryFile(e: React.MouseEvent<HTMLDivElement>) {
        if (this.state.uploadPhase !== 'error') { return; }
        this.setState({uploadPhase: 'open'});
        // this.props.submitDate();
        // this.props.sendMessage(this.state.files);
        document.removeEventListener('keypress', this.handleKeyDown.bind(this));

        e.stopPropagation();
    }

    onDrop(imageFiles: FileList) {
        if (imageFiles.length > 0) {
            this.setState({
                files: imageFiles,
                uploadPhase: 'preview'
            });
        }
      }

      showDropzone = () => {
          let returnDropzone = (
            <div>
                <div className="file-upload-title">Upload your docs</div>
                <Dropzone
                onDrop={this.onDrop.bind(this)}
                >
                    <div className="drop-text">
                        <span className="bold-line"> Drop files here to upload</span>
                        <br/>
                        <span>or <br/> click here to select files </span>
                    </div>
                </Dropzone>
                <div className="upload-skip" onClick={e => this.handleSkipFile(e) }>Skip</div>
            </div>
          );

          if (this.state.uploadPhase === 'preview') {
            returnDropzone = (
                <div>
                    <div className="file-upload-title">{this.state.files[0].name}</div>
                    <div className="file_chunk no-border">
                        <div className="drop-text add-padding">
                            <div className="fileAttach"></div>
                            <span className="bold-line">{this.state.files[0].name} </span>
                            <br/>
                            <a onClick={this.removeFile} className="remove_link" href="#"> remove file</a>
                        </div>
                    </div>
                    <div className="upload-skip" onClick={e => this.clickToSubmitFile(e) }>Press Enter to Submit</div>
                </div>
              );
           }

          if (this.state.uploadPhase === 'error') {
            returnDropzone = (
                <div>
                    <div className="file-upload-title error">Error</div>
                    <div className="file_chunk no-border">
                        <div className="drop-text add-padding">
                            <span className="bold-line">Your file not uploaded successfully.</span>
                        </div>
                    </div>
                    <div className="upload-skip" onClick={e => this.clickToRetryFile(e) }>Press Enter to Retry</div>
                </div>
              );
           }

          return returnDropzone;

      }

    render() {
        const { node } = this.props;

        return (
            <div className="fileUpload">
                { (this.state.isUploading) ? <div className="loading"></div> : null}
                { this.showDropzone() }
            </div>
        );
    }
}

export const FileUploadCard = connect(
    (state: ChatState) => ({
        // passed down to MessagePaneView
        locale: state.format.locale,
        user: state.connection.user
    }), {
        fileSelected: (inputStatus: boolean) => ({type: 'Select_File', payload: inputStatus}),
        sendMessage,
        sendFiles
    }, (stateProps: any, dispatchProps: any, ownProps: any): FileUploadProps => ({
        node: ownProps.node,
        fileSelected: dispatchProps.fileSelected,
        sendMessage: (text: any) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
        sendFiles: (files: FileList) => dispatchProps.sendFiles(files, stateProps.user, stateProps.locale),
        gid: ownProps.gid
    })
)(FileUpload);

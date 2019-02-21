import axios from 'axios';
import * as React from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { ChatActions, ChatState, sendFiles , sendMessage } from './Store';

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
    inputDisabled: boolean;
    gid: string;
    updateInput: (disabled: boolean, placeholder: string) => void;
 }

export interface FileUploadState {
    files: any;
    uploadPhase: string;
    isUploading: boolean;
    signedUrl: string;
}

export const UPLOAD_PHASES = {
    OPEN: 'open',
    ERROR: 'error',
    PREVIEW: 'preview',
    SUCCESS: 'success'
};

/**
 * File Upload card which renders in response to node of types 'file'
 * Used for file upload
 */
class FileUpload extends React.Component<FileUploadProps, FileUploadState> {
    constructor(props: FileUploadProps) {
        super(props);

        this.state = {
            files: [],
            uploadPhase: UPLOAD_PHASES.OPEN,
            isUploading: false,
            signedUrl: null
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    removeFile = () => {
        this.setState({
            files: [],
            uploadPhase: UPLOAD_PHASES.OPEN
        });
    }

    private handleKeyDown =  (e: React.KeyboardEvent<HTMLInputElement>): any => {
        if (e.key === 'Enter') {
            if (this.state.uploadPhase === UPLOAD_PHASES.ERROR) {
                this.clickToRetryFile();
            } else if (this.state.uploadPhase === UPLOAD_PHASES.PREVIEW) {
                this.clickToSubmitFile();
            }
        }
    }

    componentDidMount() {
        if (!this.props.inputDisabled) {
            this.props.updateInput(true, 'Please upload a file or skip above.');
        }

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    componentWillUnmount() {
        this.props.updateInput(false, null);
    }

    handleSkipFile(e: React.MouseEvent<HTMLDivElement>) {
        this.props.sendMessage('Skip Upload');
    }

    getSignedUrl = (data: any) => {
        return new Promise((resolve, reject) => {
            if (this.state.signedUrl) {
                resolve({s3Url: this.state.signedUrl});
            } else {
                axios.post(this.props.gid + '/api/v1/nodes/presigned_url_for_node', data)
                .then((result: any) => {
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
        if (this.state.files.length === 0 || this.state.isUploading) {
            return;
        }

        this.setState({isUploading: true});
        this.props.fileSelected(true);

        const file = this.state.files[0];
        const dataToGetSignedUrl = {
            node_id: this.props.node.node_id,
            content_type: file.type,
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
                  this.setState({isUploading: false, files: [], uploadPhase: 'success'});

                  this.props.sendMessage(this.state.signedUrl.split('?')[0]);
                } else {
                    throw Error('Something went wrong. Try again.');
                }
            }).catch(err => {
                this.props.fileSelected(false);
                this.setState({isUploading: false, files: [], uploadPhase: UPLOAD_PHASES.ERROR});
            });
        }

    clickToSubmitFile(e?: React.MouseEvent<HTMLDivElement>) {
        if (this.state.uploadPhase !== UPLOAD_PHASES.PREVIEW) { return; }
        this.submitFiles();
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));

        const a = e ? e.stopPropagation() : null;
    }

    clickToRetryFile(e?: React.MouseEvent<HTMLDivElement>) {
        if (this.state.uploadPhase !== UPLOAD_PHASES.ERROR) { return; }
        this.setState({uploadPhase: UPLOAD_PHASES.OPEN});
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));

        const a = e ? e.stopPropagation() : null;
    }

    onDrop(imageFiles: FileList) {
        if (imageFiles.length > 0) {
            this.setState({
                files: imageFiles,
                uploadPhase: UPLOAD_PHASES.PREVIEW
            });
        }
    }

    showDropzone = () => {
        let returnDropzone = (
            <div>
                <div className="file-upload-title">Upload a file</div>
                <Dropzone
                    onDrop={this.onDrop.bind(this)}
                    maxSize={1048576}
                >
                    <div className="drop-text">
                        <span className="bold-line">Drop files here to upload</span>
                        <br />
                        <span>or <br /> click here to select files </span>
                    </div>
                </Dropzone>
                <div className="upload-skip" onClick={e => this.handleSkipFile(e)}>Skip</div>
            </div>
        );

        if (this.state.uploadPhase === UPLOAD_PHASES.PREVIEW) {
            returnDropzone = (
                <div>
                    <div className="file-upload-title">{this.state.files[0].name}</div>
                    <div className="file_chunk no-border">
                        <div className="drop-text add-padding">
                            <div className="fileAttach">
                            {/*<img src="/assets/file.svg">*/}
                            </div>
                            <span className="bold-line">{this.state.files[0].name} </span>
                            <br />
                            <br />
                            <a onClick={this.removeFile} className="remove_link" href="#"> remove file</a>
                        </div>
                    </div>
                    <div className="upload-skip" onClick={e => this.clickToSubmitFile(e)}>Press Enter to Submit</div>
                </div>
            );
        }

        if (this.state.uploadPhase === UPLOAD_PHASES.ERROR) {
            returnDropzone = (
                <div>
                    <div className="file-upload-title error">Error</div>
                    <div className="file_chunk no-border">
                        <div className="drop-text add-padding">
                            <span className="bold-line">Your file was not uploaded successfully.</span>
                        </div>
                    </div>
                    <div className="upload-skip" onClick={e => this.clickToRetryFile(e)}>Press Enter to Retry</div>
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
        locale:                                                                                                                                                                                                                                                                                                                          state.format.locale,
        inputDisabled: state.shell.inputDisabled,
        user: state.connection.user
    }), {
        fileSelected:                                                                                                                                                                                                                                                                                                                          (inputStatus: boolean) => ({type:                                                                                                                                                                                                                                                                                                                          'Select_File', payload: inputStatus}),
        sendMessage,
        updateInput: (disable: boolean, placeholder: string) => ({ type:                                                                                                                                                                                                                                                                                                                          'Update_Input', placeholder, disable, source: 'text' } as ChatActions),
        sendFiles
    }, (stateProps: any, dispatchProps: any, ownProps: any): FileUploadProps => ({
        node:                                                                                                                                                                                                                                                                                                                          ownProps.node,
        inputDisabled: stateProps.inputDisabled,
        updateInput: dispatchProps.updateInput,
        fileSelected: dispatchProps.fileSelected,
        sendMessage: (text: any) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
        sendFiles: (files: FileList) => dispatchProps.sendFiles(files, stateProps.user, stateProps.locale),
        gid: ownProps.gid
    })
)(FileUpload);

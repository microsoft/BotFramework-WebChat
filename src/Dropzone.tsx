import * as React from 'react';
import Dropzone from 'react-dropzone';

const dropzone =  (props: any) => {
    return (
        <div>
        <div className="file-upload-title">Upload your docs</div>
        <Dropzone
        onDrop={() => props.dropFunction.bind(this)}
        >
            <div className="drop-text">
                <span className="bold-line"> Drop files here to upload</span>
                <br/>
                <span>or <br/> click here to select files </span>
            </div>
        </Dropzone>
        <div className="upload-skip">Skip</div>
    </div>
    );
};

export default dropzone;

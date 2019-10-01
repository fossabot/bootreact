import React from 'react';
import {Button, Form} from "react-bootstrap";

export class CreateDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        const newDataSet = {};
        this.props.attributes.forEach(attribute => {
            newDataSet[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onCreate(newDataSet);
        this.props.attributes.forEach(attribute => {
            ReactDOM.findDOMNode(this.refs[attribute]).value = ''; // clear out the dialog's inputs
        });
        window.location = "#";
    }

    render() {
        const inputs = this.props.attributes.map(attribute =>
            <p key={attribute}>
                <input type="text" placeholder={attribute} ref={attribute} className="field"/>
            </p>
        );
        return (
            <div>
                <a className="btn btn-primary" href="#createDataSet">Create</a>

                <div id="createDataSet" className="modalDialog">
                    <div>
                        <a className="btn btn-primary" href="#" title="Close" className="close">X</a>

                        <h2>Create new dataSet</h2>

                        <Form>
                            {inputs}
                            <Button onClick={this.handleSubmit}>Create</Button>
                        </Form>
                    </div>
                </div>
            </div>
        )
    }
}
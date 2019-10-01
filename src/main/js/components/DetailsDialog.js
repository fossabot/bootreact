import React from 'react';
import {Button, Form} from "react-bootstrap";

export class DetailsDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        const updatedDataSet = {};
        this.props.attributes.forEach(attribute => {
            updatedDataSet[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onUpdate(this.props.dataSet, updatedDataSet);
        window.location = "#";
    }

    render() {
        const inputs = this.props.attributes.map(attribute =>
            <p key={this.props.dataSet.entity[attribute]}>
                <input type="text" placeholder={attribute}
                       defaultValue={this.props.dataSet.entity[attribute]}
                       ref={attribute} className="field"/>
            </p>
        );

        const dialogId = "updateDataSet-" + this.props.dataSet.entity._links.self.href;

        return (
            <div>
                <a className="btn btn-primary" href={"#" + dialogId}>Details</a>

                <div id={dialogId} className="modalDialog">
                    <div>
                        <a className="btn btn-primary" href="#" title="Close" className="close">X</a>

                        <h2>Update a dataSet</h2>

                        <Form>
                            {inputs}
                            <Button onClick={this.handleSubmit}>Update</Button>
                        </Form>
                    </div>
                </div>
            </div>
        )
    }
}
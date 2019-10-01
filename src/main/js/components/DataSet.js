import React from 'react';
import {Button} from "react-bootstrap";
import {UpdateDialog} from "./UpdateDialog";

export class DataSet extends React.Component {

    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        this.props.onDelete(this.props.dataSet);
    }

    render() {
        return (
            <tr>
                <td>{this.props.dataSet.entity.name}</td>
                <td>{this.props.dataSet.entity.age}</td>
                <td>{this.props.dataSet.entity.diagnosis}</td>
                <td>
                    <UpdateDialog dataSet={this.props.dataSet}
                                  attributes={this.props.attributes}
                                  onUpdate={this.props.onUpdate}/>
                </td>
                <td>
                    <Button onClick={this.handleDelete}>Delete</Button>
                </td>
            </tr>
        )
    }
}
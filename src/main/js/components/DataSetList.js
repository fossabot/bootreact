import React from 'react';
import {Button, Table} from "react-bootstrap";
import { DataSet } from "./DataSet"

export class DataSetList extends React.Component {

    constructor(props) {
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(e) {
        e.preventDefault();
        const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
        if (/^[0-9]+$/.test(pageSize)) {
            this.props.updatePageSize(pageSize);
        } else {
            ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
        }
    }

    handleNavFirst(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.first.href);
    }

    handleNavPrev(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.prev.href);
    }

    handleNavNext(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.next.href);
    }

    handleNavLast(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.last.href);
    }

    render() {
        const pageInfo = this.props.page.hasOwnProperty("number") ?
            <h3>dataSets - displaying page {this.props.page.number + 1} of {this.props.page.totalPages}
                , showing <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/> per page
            </h3> : null;

        const dataSets = this.props.dataSets.map(dataSet =>
            <DataSet key={dataSet.entity._links.self.href}
                     dataSet={dataSet}
                     attributes={this.props.attributes}
                     onUpdate={this.props.onUpdate}
                     onDelete={this.props.onDelete}/>
        );

        const navLinks = [];
        if ("first" in this.props.links) {
            navLinks.push(<Button key="first" onClick={this.handleNavFirst}>&lt;&lt;</Button>);
        }
        if ("prev" in this.props.links) {
            navLinks.push(<Button key="prev" onClick={this.handleNavPrev}>&lt;</Button>);
        }
        if ("next" in this.props.links) {
            navLinks.push(<Button key="next" onClick={this.handleNavNext}>&gt;</Button>);
        }
        if ("last" in this.props.links) {
            navLinks.push(<Button key="last" onClick={this.handleNavLast}>&gt;&gt;</Button>);
        }

        return (
            <div>
                {pageInfo}
                <Table striped>
                    <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Diagnosis</th>
                        <th colSpan={2}>Actions</th>
                    </tr>
                    {dataSets}
                    </tbody>
                </Table>
                <div>
                    {navLinks}
                </div>
            </div>
        )
    }
}
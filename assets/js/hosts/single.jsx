import DataTable from 'react-data-table-component';
import * as React from 'react'
import * as ReactDOM from 'react-dom';
import { ARSENIC_API_URL } from 'js/lib/const';
import * as params from '@params';
import { defaultThemes } from 'js/lib/themes';

const customStyles = {
	header: {
		style: {
			minHeight: '56px',
		},
	},
	headRow: {
		style: {
			borderTopStyle: 'solid',
			borderTopWidth: '1px',
			borderTopColor: defaultThemes.default.divider.default,
		},
	},
	headCells: {
		style: {
			'&:not(:last-of-type)': {
				borderRightStyle: 'solid',
				borderRightWidth: '1px',
				borderRightColor: defaultThemes.default.divider.default,
			},
		},
	},
	cells: {
		style: {
			'&:not(:last-of-type)': {
				borderRightStyle: 'solid',
				borderRightWidth: '1px',
				borderRightColor: defaultThemes.default.divider.default,
			},
		},
	},
};

class UrlCell extends React.Component {
	constructor(props) {
		super(props);

		this.data = props.data

		let isRedirect = this.data.Redirect && this.data.Redirect != ""
		this.columns = [
			{
				cell: row => (
					<div>
						<div>{row.Url}</div>
						{isRedirect &&
							<div>
								{row.Redirect}
							</div>
						}
						
					</div>
				)
			},
			{
				cell: () => <i className="fa-solid fa-arrow-rotate-right fa-rotate-by rotate-160"></i>,
				omit: !isRedirect,
				right: true
			},
		];
	}

	render() {
		return (
			<DataTable 
				columns={this.columns}
				data={[this.data]}
				noHeader
				noTableHead
			/>
		)
	}
}

class ContentTable extends React.Component {
	constructor(props) {
		super(props);

		this.columns = [
			{
				name: 'URL',
				selector: row => row.Url,
				sortable: true,
				cell: row => <UrlCell data={row}/>
			},
			{
				name: 'Content Type',
				selector: row => row.ContentType,
				sortable: true
			},
			{
				name: 'Content Length',
				selector: row => row.ContentLength,
				sortable: true
			},
		];

		this.data = props.data
	}

	render() {
		return (
			<DataTable
				columns={this.columns}
				data={this.data}
				customStyles={customStyles}
				pagination 
			/>
		);
	}
}

const ExpandedGroupComponent = ({ data: group }) => <ContentTable data={group.data} />;

class HostContent extends React.Component {
	constructor(props) {
		super(props);

		this.columns = [
			{
				name: '',
				selector: row => row.group,
			},
			{
				name: 'Count',
				selector: row => row.count,
			}
		];

		this.host = props.host
		this.state = {
			pending: true,
			results: []
		}
		this.url = `${ARSENIC_API_URL}/host/content`
	}

	fetchResults() {
		$.post(this.url, JSON.stringify({
			host: this.host
		}), (data) => {
			let results = []
			for (const group of Object.keys(data)) {
				results.push({
					group: group,
					count: data[group].length,
					data: data[group]
				})
			}
			this.setState({pending: false, results: results})
		}).fail(() => {
			this.setState({pending: false, results: []})
			console.log("Error getting host content results")
		})
	}

	render() {
		if (this.state.pending) {
			this.fetchResults()
		}
		return (
			<DataTable
				columns={this.columns}
				data={this.state.results}
				expandableRows
				expandableRowsComponent={ExpandedGroupComponent}
				highlightOnHover
			/>
		);
	}
}

const domContainer = document.querySelector('#host-content');
ReactDOM.render(<HostContent host={params.host}/>, domContainer);

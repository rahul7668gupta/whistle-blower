import React, { Component } from "react";
import whistleBlower from "./contracts/WhistleBlower.json";
import Portis from '@portis/web3';
import Web3 from 'web3';

import "./App.css";

class App extends Component {
  constructor() {
    super()
    this.state = {
      web3: {},
      contractAddress: ""
    }
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const customNode = {
        nodeUrl: 'https://rpc-mumbai.matic.today/',
        chainId: 80001,
      };
      
      const portis = new Portis('fa8f42fe-5b1d-414b-a511-1f28494d6852', customNode);
      this.web3 = new Web3(portis.provider);

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();
      console.log("Accounts from metamask: " + this.accounts);

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      console.log("Matic network ID: " + this.networkId);
      
      this.whistleBlowerContract = new this.web3.eth.Contract(
        whistleBlower.abi,
        whistleBlower.networks[this.networkId] && whistleBlower.networks[this.networkId].address,
      );
      console.log("Contract Instance : " + this.whistleBlowerContract);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3: this.web3,
        contractAddress: whistleBlower.networks[this.networkId].address
      });
      console.log("Web3 Obj : " + this.state.web3);
      portis.isLoggedIn().then(({ error, result }) => {
        console.log(error, result);
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleRegisterOrganisation = async() => {
    let newOrg = await this.whistleBlowerContract.methods.registerOrganisation(
      this.state.orgName,
      this.state.orgType,
      this.state.orgAddress,
      this.state.url,
      this.state.noOfOrgs
    ).send({ from: this.accounts[0] })
    console.log(newOrg);
  }

  getNoOfOrgs = async() => {
    const noOfOrgs = await this.whistleBlowerContract.methods.organisationMappingLength;
    this.setState({
      noOfOrgs: noOfOrgs
    })
  }

  getCaseCount = async() =>  {
    const caseCount = await this.whistleBlowerContract.methods.caseMappingLength;
    this.setState({
      caseCount: caseCount
    })
  }

  handleCaseMapping = async() =>  {
    let caseArray = [];
    for (let i = 0; i < this.state.caseCount; i++) {
      let caseData = await this.whistleBlowerContract.methods.caseMapping(i).call();
      caseArray.push(caseData);
    }
    this.setState({
      caseArray: caseArray
    })
  }

  handleOrganisationMapping = async() =>  {
    let orgArray = [];
    for (let i = 0; i < this.state.noOfOrgs; i++) {
      let orgData = await this.whistleBlowerContract.methods.organisationMapping(i).call();
      orgArray.push(orgData);
    }
    this.setState({
      orgArray: orgArray
    })
  }

  handleOrgCaseCount = async(address) => {
    let thisOrgCaseCount = await this.whistleBlowerContract.methods.orgCaseCount(address).call();
    console.log(thisOrgCaseCount);
  }

  handleOrgLogin = async (address) => {
    return await this.whistleBlowerContract.methods.isAnOrganisationLogin(address).call();
  }

  handleCreateCase = async (address) => {
    let newCase = await this.whistleBlowerContract.methods.createCase(
      this.state.title,
      this.state.description,
      this.state.proof,
      this.accounts[0],
      this.state.url,
      this.state.caseCount
    ).send({ from: this.accounts[0] })
    console.log(newCase);
  }

  handleApproveValidity = async (id) => {
    let approved = await this.whistleBlowerContract.methods.approveValidity(id).send({
      from: this.accounts[0]
    });
    console.log("Validity Increased: " + approved);
  }
  
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <p>Contract Address : "{this.state.contractAddress}"</p>
      </div>
    );
  }
}

export default App;

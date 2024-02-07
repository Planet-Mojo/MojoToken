// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OFT} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol";

contract MojoToken is OFT {
    uint256 public constant MAX_TOTAL_SUPPLY = 1_000_000_000 * 10 ** 18;

    bool public areTransfersPaused;
    bool public isPausingAllowed;
    address public allowedTokenSender;

    constructor(
        address _owner,
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        bool shouldMintInitialSupply
    ) OFT(_name, _symbol, _lzEndpoint, _owner) {
        isPausingAllowed = true;
      
        _transferOwnership(_owner);

        // This will only be true on a single chain
        if (shouldMintInitialSupply) {
            _mint(_owner, MAX_TOTAL_SUPPLY);
        }
    }

    function pauseTransfers() external onlyOwner {
        require(isPausingAllowed, "Pausing is not allowed");

        if (areTransfersPaused) {
            revert("Transfers are already paused");
        }

        areTransfersPaused = true;
    }

    function unpauseTransfers() external onlyOwner {
        if (!areTransfersPaused) {
            revert("Transfers are not paused");
        }
        
        areTransfersPaused = false;
    }

    function setAllowedTokenSender(address _allowedTokenSender) external onlyOwner {
        allowedTokenSender = _allowedTokenSender;
    }

    function disablePausingAbility() external onlyOwner() {
        if (isPausingAllowed) {
            isPausingAllowed = false;
        }

        if (areTransfersPaused) {
            areTransfersPaused = false;
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(!areTransfersPaused || (allowedTokenSender != address(0) && from == allowedTokenSender), "Transfer is not allowed");
        super._beforeTokenTransfer(from, to, amount);
    }
}

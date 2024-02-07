// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {OFT} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol";

/// @title MojoToken
/// @notice This is the token contract for the Mojo ERC20 token
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

    /// @notice Pauses all transfers
    /// @dev This function can only be called if pausing is allowed and transfers are not already paused
    function pauseTransfers() external onlyOwner {
        require(isPausingAllowed, "Pausing is not allowed");
        require(!areTransfersPaused, "Transfers are already paused");

        areTransfersPaused = true;
    }

    /// @notice Unpauses all transfers
    /// @dev This function can only be called if transfers are paused
    function unpauseTransfers() external onlyOwner {
        require(areTransfersPaused, "Transfers are already paused");
        
        areTransfersPaused = false;
    }

    /// @notice Sets the allowed token sender
    /// @param _allowedTokenSender The address of the account that is allowed to send tokens when transfers are paused
    function setAllowedTokenSender(address _allowedTokenSender) external onlyOwner {
        allowedTokenSender = _allowedTokenSender;
    }

    /// @notice Disables the ability to pause transfers
    /// @dev Removes the ability to pause transfers and unpauses all transfers
    /// This is a one-way function and cannot be undone
    function disablePausingAbility() external onlyOwner() {
        if (isPausingAllowed) {
            isPausingAllowed = false;
        }

        if (areTransfersPaused) {
            areTransfersPaused = false;
        }
    }

    /// @notice This function is called before every transfer
    /// @dev It checks if transfers are paused and if the sender is allowed to transfer
    /// If transfers are paused, only the allowed token sender can transfer
    /// @param from The address of the sender
    /// @param to The address of the recipient
    /// @param amount The amount of tokens to transfer
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(!areTransfersPaused || (allowedTokenSender != address(0) && from == allowedTokenSender), "Transfer is not allowed");
        super._beforeTokenTransfer(from, to, amount);
    }
}

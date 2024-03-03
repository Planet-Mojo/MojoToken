// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import "forge-std/Vm.sol";
import {MojoToken} from "../../contracts/token/erc20/MojoToken.sol";
import {EndpointV2Mock} from "@layerzerolabs/test-devtools-evm-hardhat/contracts/mocks/EndpointV2Mock.sol";

contract MojoTokenTest is Test {
    uint256 constant decimals = 18;

    MojoToken public token;
    EndpointV2Mock public endpoint;
    uint32 public eid = 1;
    address public owner = vm.addr(1); // has 1bn - 100 tokens
    address public user1 = vm.addr(2); // has 100 tokens
    address public user2 = vm.addr(3); // has 0 tokens

    function setUp() external {
        endpoint = new EndpointV2Mock(eid);
        token = new MojoToken(
            address(owner),
            "Mojo",
            "MOJO",
            address(endpoint),
            true
        );

        _send(owner, user1, 100);
    }

    function testInitialMintIsSuccessfulOnDeploy() external {
        assertEq(token.totalSupply(), _tokens(1_000_000_000));
    }

    function testInitialStateOfPausingFlags() external {
        assertEq(token.areTransfersPaused(), false);
        assertEq(token.isPausingAllowed(), true);
    }

    function testOwnerCanPauseAndUnpause() external {
        vm.prank(owner);
        token.pauseTransfers();
        assertEq(token.areTransfersPaused(), true);

        vm.prank(owner);
        token.unpauseTransfers();
        assertEq(token.areTransfersPaused(), false);
    }

    function testNonOwnerCantPauseAndUnpause() external {
        // User1 should not be able to pause
        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(user1);
        token.pauseTransfers();

        // Owner should be able to pause
        vm.prank(owner);
        token.pauseTransfers();
        assertEq(token.areTransfersPaused(), true);

        // User1 should not be able to unpause
        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(user1);
        token.unpauseTransfers();

        // Owner should be able to unpause
        vm.prank(owner);
        token.unpauseTransfers();
        assertEq(token.areTransfersPaused(), false);
    }

    function testAllowedTokenSenderCantPauseAndUnpause() external {
        // Set user1 as allowed token sender
        vm.prank(owner);
        token.setAllowedTokenSender(address(user1));
        assertEq(token.allowedTokenSender(), address(user1));

        // User1 should not be able to pause
        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(user1);
        token.pauseTransfers();

        // Owner should be able to pause
        vm.prank(owner);
        token.pauseTransfers();
        assertEq(token.areTransfersPaused(), true);

        // User1 should not be able to unpause
        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(user1);
        token.unpauseTransfers();

        // Owner should be able to unpause
        vm.prank(owner);
        token.unpauseTransfers();
        assertEq(token.areTransfersPaused(), false);
    }

    function testRevertOnPausingWhenAlreadyPaused() external {
        _pauseTransfers();

        vm.expectRevert(MojoToken.TransfersAlreadyPaused.selector);
        _pauseTransfers();
    }

    function testRevertOnUnpausingWhenNotPaused() external {
        vm.expectRevert(MojoToken.TransfersNotPaused.selector);
        _unpauseTransfers();
    }

    function testDisablingPausingAbilityEnablesTransfers() external {
        assertEq(token.isPausingAllowed(), true);
       
        vm.prank(owner);
        token.pauseTransfers();
        assertEq(token.areTransfersPaused(), true);

        vm.prank(owner);
        token.disablePausingAbility();
        assertEq(token.isPausingAllowed(), false);
        assertEq(token.areTransfersPaused(), false);
    }

    function _pauseTransfers() internal {
        vm.prank(owner);
        token.pauseTransfers();
        assertEq(token.areTransfersPaused(), true);
    }

    function _unpauseTransfers() internal {
        vm.prank(owner);
        token.unpauseTransfers();
        assertEq(token.areTransfersPaused(), false);
    }

    function testDisablingPausingAbility() external {
        vm.prank(owner);
        token.disablePausingAbility();
        assertEq(token.isPausingAllowed(), false);

        // Attempt to pause transfers should fail after disabling pausing ability
        vm.expectRevert(MojoToken.PausingNotAllowed.selector);
        vm.prank(owner);
        token.pauseTransfers();
    }

    function testTransferWorks() external {
        _send(owner, user1, 100);
        _send(owner, user2, 100);
        _send(user1, user2, 100);

        assertEq(token.balanceOf(user1), _tokens(100));
        assertEq(token.balanceOf(user2), _tokens(200));
        assertEq(token.balanceOf(owner), _tokens(1_000_000_000 - 300));        
    }

    function testPauseTransfersDisablesAllTransfers() external {
        _pauseTransfers();

        vm.expectRevert(MojoToken.TransfersPaused.selector);
        _send(owner, user1, 100);
        
        vm.expectRevert(MojoToken.TransfersPaused.selector);
        _send(user1, user2, 100);
    }

    function testUnpauseTransfersEnablesAllTransfers() external {
        _pauseTransfers();

        vm.expectRevert(MojoToken.TransfersPaused.selector);
        _send(owner, user1, 100);

        _unpauseTransfers();

        // Transfers should be successful after unpausing
        _send(owner, user1, 100);
        _send(owner, user2, 100);
        _send(user1, user2, 100);

        // Verify transfers were successful
        assertEq(token.balanceOf(user1), _tokens(100));
        assertEq(token.balanceOf(user2), _tokens(200));
        assertEq(token.balanceOf(owner), _tokens(1_000_000_000 - 300));
    }

    function testNonAllowedSenderCannotTransferWhenPaused() external {
        _send(owner, user2, 100);
       
        // Set user1 as allowed token sender
        vm.prank(owner);
        token.setAllowedTokenSender(address(user1));
        assertEq(token.allowedTokenSender(), address(user1));

        _pauseTransfers();

        vm.expectRevert(MojoToken.TransfersPaused.selector);
        _send(owner, user1, 100);

        vm.expectRevert(MojoToken.TransfersPaused.selector);
        _send(user2, user1, 100);
    }

    function testAllowedSenderCanTransferWhenPaused() external {
        _send(owner, user2, 100);
       
        // Set user1 as allowed token sender
        vm.prank(owner);
        token.setAllowedTokenSender(address(user1));
        assertEq(token.allowedTokenSender(), address(user1));
        
        _pauseTransfers();

        // Disallowed token sender should not be able to transfer tokens when paused
        vm.expectRevert(MojoToken.TransfersPaused.selector);
        _send(owner, user1, 100);
        vm.expectRevert(MojoToken.TransfersPaused.selector);
        _send(user2, user1, 100);

        // Allowed token sender should be able to transfer tokens even when paused
        _send(user1, user2, 100);
        
        // Verify transfer was successful
        assertEq(token.balanceOf(user2), _tokens(200));
    }

    function testChangingAllowedTokenSender() external {
        _send(owner, user2, 100);
       
        // Set user1 as allowed token sender
        vm.prank(owner);
        token.setAllowedTokenSender(address(user1));
        assertEq(token.allowedTokenSender(), address(user1));
        
        _pauseTransfers();

        // Disallowed token sender should not be able to transfer tokens when paused
        vm.expectRevert(MojoToken.TransfersPaused.selector);
        _send(user2, user1, 100);

        // Allowed token sender should be able to transfer tokens even when paused
        _send(user1, user2, 100);

        // Verify transfer was successful
        assertEq(token.balanceOf(user1), _tokens(0));
        assertEq(token.balanceOf(user2), _tokens(200));

        // Change allowed token sender to user2
        vm.prank(owner);
        token.setAllowedTokenSender(address(user2));
        assertEq(token.allowedTokenSender(), address(user2));

        // Disallowed token sender should not be able to transfer tokens when paused
        vm.expectRevert(MojoToken.TransfersPaused.selector);
        _send(user1, user2, 100);

        // Allowed token sender should be able to transfer tokens even when paused
        _send(user2, user1, 100);

        // Verify transfer was successful
        assertEq(token.balanceOf(user1), _tokens(100));
        assertEq(token.balanceOf(user2), _tokens(100));
    }

    function _send(address from, address to, uint256 amount) internal {
        vm.prank(from);
        token.transfer(to, _tokens(amount));
    }

    function _tokens(uint256 amount) internal pure returns (uint256) {
        return amount * 10 ** decimals;
    }
}

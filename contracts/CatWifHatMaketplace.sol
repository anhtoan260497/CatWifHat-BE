// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol"; // https://forum.openzeppelin.com/t/fail-with-error-erc721-transfer-to-non-erc721receiver-implementer/28138/5

error CatWifHatMarketplace__PriceMustBeAboveZero();
error CatWifHatMarketplace__NotOwnedThisNFT();
error CatWifHatMarketplace__NotEnoughMoney();
error CatWifHatMarketplace__NotListed();
error CatWifHatMarketplace__DontHaveAnyProceeds();
error CatWifHatMarketplace__WidthdrawFailed();
error CatWifHatMarketplace__NotApproved();

contract CatWifHatMarketplace is ReentrancyGuard, ERC721Holder {
    // listing x
    // buy
    // cancel
    // update
    // widthdraw money

    // listing : {
    //     nftAddress : {
    //         tokenId : {
    //             price
    //             seller
    //         }
    //     }
    // }

    struct SellItem {
        uint256 price;
        address seller;
    }

    event ItemListed(
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    event ItemCancelled(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller
    );

    event ItemUpdated(
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 newPrice
    );

    event ProceedsWithdraw(address indexed seller, uint256 amount);

    modifier isListed(address nftAddress, uint256 tokenId) {
        if (s_listing[nftAddress][tokenId].price == 0)
            revert CatWifHatMarketplace__NotListed();
        _;
    }

    modifier isOwned(address nftAddress, uint256 tokenId) {
        if (s_listing[nftAddress][tokenId].seller != msg.sender)
            revert CatWifHatMarketplace__NotOwnedThisNFT();
        _;
    }

    mapping(address => mapping(uint256 => SellItem)) public s_listing;
    mapping(address => uint256) private s_proceeds;

    function listingItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external {
        if (price <= 0) revert CatWifHatMarketplace__PriceMustBeAboveZero();
        IERC721 nft = IERC721(nftAddress);
        if (nft.ownerOf(tokenId) != msg.sender)
            revert CatWifHatMarketplace__NotOwnedThisNFT();

        if (nft.getApproved(tokenId) != address(this))
            revert CatWifHatMarketplace__NotApproved();

        nft.safeTransferFrom(msg.sender, address(this), tokenId);
        s_listing[nftAddress][tokenId] = SellItem(price, msg.sender);
        emit ItemListed(nftAddress, tokenId, price);
    }

    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable isListed(nftAddress, tokenId) {
        if (s_listing[nftAddress][tokenId].price > msg.value)
            revert CatWifHatMarketplace__NotEnoughMoney();
        s_proceeds[msg.sender] += msg.value;
        delete s_listing[nftAddress][tokenId];
        IERC721 nft = IERC721(nftAddress);
        nft.safeTransferFrom(address(this), msg.sender, tokenId);
        emit ItemBought(nftAddress, tokenId, msg.sender, msg.value);
    }

    function cancelItem(
        address nftAddress,
        uint256 tokenId
    ) external isListed(nftAddress, tokenId) isOwned(nftAddress, tokenId) {
        IERC721 nft = IERC721(nftAddress);
        address seller = s_listing[nftAddress][tokenId].seller;
        delete s_listing[nftAddress][tokenId];
        nft.safeTransferFrom(address(this), seller, tokenId);
        emit ItemCancelled(nftAddress, tokenId, seller);
    }

    function updateItem(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isListed(nftAddress, tokenId) isOwned(nftAddress, tokenId) {
        s_listing[nftAddress][tokenId].price = newPrice;
        emit ItemUpdated(nftAddress, tokenId, newPrice);
    }

    function widthdrawProceeds() external nonReentrant {
        uint256 sellerProceed = s_proceeds[msg.sender];
        if (sellerProceed == 0)
            revert CatWifHatMarketplace__DontHaveAnyProceeds();
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: sellerProceed}("");
        if (!success) revert CatWifHatMarketplace__WidthdrawFailed();
        emit ProceedsWithdraw(msg.sender, sellerProceed);
    }

    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (SellItem memory) {
        return s_listing[nftAddress][tokenId];
    }

    function getProceed() external view returns (uint256) {
        return s_proceeds[msg.sender];
    }
}

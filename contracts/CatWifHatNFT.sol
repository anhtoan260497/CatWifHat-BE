// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";

error CatWifHatNFT__MaximumNftExceed();
error CatWifHatNFT__MinterAlreadyHasAToken();

contract CatWifHatNFT is ERC721 {
    string s_tokenURI;
    uint256 s_tokenId;

    constructor(string memory _tokenURI) ERC721("CatWifHat", "CatWifHat") {
        s_tokenURI = _tokenURI;
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return s_tokenURI;
    }

    function mintNFT(address _minter) external {
        if (s_tokenId > 100) revert CatWifHatNFT__MaximumNftExceed();
        IERC721 nft = IERC721(address(this));
        if (nft.balanceOf(_minter) >= 1)
            revert CatWifHatNFT__MinterAlreadyHasAToken();
        _safeMint(_minter, s_tokenId);
        s_tokenId++;
    }
}

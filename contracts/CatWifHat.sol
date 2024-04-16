// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract CatWifhat is Ownable, ERC20 {
    using SafeERC20 for IERC20;

    uint256 public marketingTaxBuy;
    uint256 public marketingTaxSell;
    uint256 public marketingTaxTransfer;

    uint256 public immutable denominator;

    address public marketingWallet;

    bool private swapping;
    uint256 public swapTokensAtAmount;
    bool public isSwapBackEnabled;

    IUniswapV2Router02 public immutable uniswapV2Router;
    address public immutable uniswapV2Pair;

    mapping(address => bool) private _isAutomatedMarketMakerPair;
    mapping(address => bool) private _isExcludedFromFees;

    modifier inSwap() {
        swapping = true;
        _;
        swapping = false;
    }

    event UpdateBuyTax(uint256 marketingTaxBuy);
    event UpdateSellTax(uint256 marketingTaxSell);
    event UpdateTransferTax(uint256 marketingTaxTransfer);
    event UpdateMarketingWallet(address indexed marketingWallet);
    event UpdateSwapTokensAtAmount(uint256 swapTokensAtAmount);
    event UpdateSwapBackStatus(bool status);
    event UpdateAutomatedMarketMakerPair(address indexed pair, bool status);
    event UpdateExcludeFromFees(address indexed account, bool isExcluded);

    constructor(address _owner) ERC20("PoorWifHat", "POOR") Ownable(_owner) {
        _mint(owner(), 100_000 * (10 ** 18));

        marketingTaxBuy = 500;
        marketingTaxSell = 500;
        marketingTaxTransfer = 500;

        denominator = 10_000;

        marketingWallet = 0xfC3bC6a8DcbA59dDf036C1513004Ede74d9533d5;

        swapTokensAtAmount = totalSupply() / 100_000;
        isSwapBackEnabled = true;
        address router = getRouterAddress();
        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(router);
        uniswapV2Router = _uniswapV2Router;
        address _uniswapV2Pair = IUniswapV2Factory(_uniswapV2Router.factory())
            .createPair(address(this), _uniswapV2Router.WETH());
        uniswapV2Pair = _uniswapV2Pair;

        _approve(address(this), address(_uniswapV2Router), type(uint256).max);

        _isAutomatedMarketMakerPair[address(_uniswapV2Pair)] = true;

        _isExcludedFromFees[address(this)] = true;
        _isExcludedFromFees[address(_uniswapV2Router)] = true;
        _isExcludedFromFees[address(owner())] = true;
        _isExcludedFromFees[address(0xdead)] = true;
    }

    receive() external payable {}

    fallback() external payable {}

    function isContract(address account) internal view returns (bool) {
        return account.code.length > 0;
    }

    function getRouterAddress() public view returns (address) {
        if (block.chainid == 56) {
            return 0x10ED43C718714eb63d5aA57B78B54704E256024E;
        } else if (block.chainid == 97) {
            return 0xD99D1c33F9fC3444f8101754aBC46c52416550D1;
        } else if (block.chainid == 1 || block.chainid == 5) {
            return 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
        } else {
            revert("Cannot found router on this network");
        }
    }

    function claimStuckTokens(address token) external onlyOwner {
        require(token != address(this), "Owner cannot claim native tokens");

        if (token == address(0x0)) {
            payable(msg.sender).transfer(address(this).balance);
            return;
        }
        IERC20 ERC20token = IERC20(token);
        uint256 balance = ERC20token.balanceOf(address(this));
        ERC20token.safeTransfer(msg.sender, balance);
    }

    function setBuyTax(uint256 _marketingTaxBuy) external onlyOwner {
        require(
            marketingTaxBuy != _marketingTaxBuy,
            "Buy Tax already on that amount"
        );
        require(_marketingTaxBuy <= 1_000, "Buy Tax cannot be more than 10%");

        marketingTaxBuy = _marketingTaxBuy;

        emit UpdateBuyTax(_marketingTaxBuy);
    }

    function setSellTax(uint256 _marketingTaxSell) external onlyOwner {
        require(
            marketingTaxSell != _marketingTaxSell,
            "Sell Tax already on that amount"
        );
        require(_marketingTaxSell <= 1_000, "Sell Tax cannot be more than 10%");

        marketingTaxSell = _marketingTaxSell;

        emit UpdateSellTax(_marketingTaxSell);
    }

    function setTransferTax(uint256 _marketingTaxTransfer) external onlyOwner {
        require(
            marketingTaxTransfer != _marketingTaxTransfer,
            "Transfer Tax already on that amount"
        );
        require(
            _marketingTaxTransfer <= 1_000,
            "Transfer Tax cannot be more than 10%"
        );

        marketingTaxTransfer = _marketingTaxTransfer;

        emit UpdateTransferTax(_marketingTaxTransfer);
    }

    function setMarketingWallet(address _marketingWallet) external onlyOwner {
        require(
            _marketingWallet != marketingWallet,
            "Marketing wallet is already that address"
        );
        require(
            _marketingWallet != address(0),
            "Marketing wallet cannot be the zero address"
        );
        require(
            !isContract(_marketingWallet),
            "Marketing wallet cannot be a contract"
        );

        marketingWallet = _marketingWallet;
        emit UpdateMarketingWallet(_marketingWallet);
    }

    function setSwapTokensAtAmount(uint256 amount) external onlyOwner {
        require(
            swapTokensAtAmount != amount,
            "SwapTokensAtAmount already on that amount"
        );
        require(
            amount >= totalSupply() / 1_000_000,
            "Amount must be equal or greater than 0.000001% of Total Supply"
        );

        swapTokensAtAmount = amount;

        emit UpdateSwapTokensAtAmount(amount);
    }

    function toggleSwapBack(bool status) external onlyOwner {
        require(isSwapBackEnabled != status, "SwapBack already on status");

        isSwapBackEnabled = status;
        emit UpdateSwapBackStatus(status);
    }

    function setAutomatedMarketMakerPair(
        address pair,
        bool status
    ) external onlyOwner {
        require(
            _isAutomatedMarketMakerPair[pair] != status,
            "Pair address is already the value of 'status'"
        );
        require(pair != address(uniswapV2Pair), "Cannot set this pair");

        _isAutomatedMarketMakerPair[pair] = status;

        emit UpdateAutomatedMarketMakerPair(pair, status);
    }

    function isAutomatedMarketMakerPair(
        address pair
    ) external view returns (bool) {
        return _isAutomatedMarketMakerPair[pair];
    }

    function setExcludeFromFees(
        address account,
        bool excluded
    ) external onlyOwner {
        require(
            _isExcludedFromFees[account] != excluded,
            "Account is already the value of 'excluded'"
        );
        _isExcludedFromFees[account] = excluded;

        emit UpdateExcludeFromFees(account, excluded);
    }

    function isExcludedFromFees(address account) external view returns (bool) {
        return _isExcludedFromFees[account];
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        if (amount == 0) {
            super._transfer(from, to, 0);
            return;
        }

        uint256 contractTokenBalance = balanceOf(address(this));

        bool canSwap = contractTokenBalance >= swapTokensAtAmount;

        if (
            canSwap &&
            !swapping &&
            _isAutomatedMarketMakerPair[to] &&
            isSwapBackEnabled
        ) {
            swapBack();
        }

        bool takeFee = true;

        if (_isExcludedFromFees[from] || _isExcludedFromFees[to] || swapping) {
            takeFee = false;
        }

        if (takeFee) {
            uint256 tempMarketingAmount;

            if (_isAutomatedMarketMakerPair[from]) {
                tempMarketingAmount = (amount * marketingTaxBuy) / denominator;
            } else if (_isAutomatedMarketMakerPair[to]) {
                tempMarketingAmount = (amount * marketingTaxSell) / denominator;
            } else {
                tempMarketingAmount =
                    (amount * marketingTaxTransfer) /
                    denominator;
            }

            uint256 fees = tempMarketingAmount;

            if (fees > 0) {
                amount -= fees;
                super._transfer(from, address(this), fees);
            }
        }

        super._transfer(from, to, amount);
    }

    function swapBack() internal inSwap {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = uniswapV2Router.WETH();

        uint256 contractTokenBalance = balanceOf(address(this));

        if (contractTokenBalance > 0) {
            try
                uniswapV2Router
                    .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                        contractTokenBalance,
                        0,
                        path,
                        address(marketingWallet),
                        block.timestamp
                    )
            {} catch {
                return;
            }
        }
    }

    function manualSwapBack() external {
        uint256 contractTokenBalance = balanceOf(address(this));

        require(contractTokenBalance > 0, "Cant Swap Back 0 Token!");

        swapBack();
    }
}



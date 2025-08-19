// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SourdoughRegistry is ERC721, Ownable {
    uint256 private _idCounter = 0;

    struct StarterMeta {
        uint64 bornAt;          // block timestamp of mint
        uint256[] parentIds;    // 0 genesis, 1 split, >1 merge
        string metadataURI;     // ipfs://... (off-chain JSON)
    }

    mapping(uint256 => StarterMeta) private _meta; // tokenId => meta

    event StarterMinted(uint256 indexed id, uint256[] parentIds, address indexed owner, string uri);
    event MetadataUpdated(uint256 indexed id, string newURI);
    event EventAnchored(uint256 indexed id, bytes32 indexed batchHash, string kind);

    constructor() ERC721("SourdoughStarter", "LEVAIN") {}

    // === Internal ID counter ===
    function _nextId() internal returns (uint256) {
        _idCounter += 1;
        return _idCounter;
    }

    // === Mints (owner-guarded for MVP) ===
    function mintGenesis(address to, string calldata uri) external onlyOwner returns (uint256) {
        uint256 id = _nextId();
        _safeMint(to, id);
        uint256[] memory parents = new uint256[](0);
        _meta[id] = StarterMeta({
            bornAt: uint64(block.timestamp),
            parentIds: parents,
            metadataURI: uri
        });
        emit StarterMinted(id, parents, to, uri);
        return id;
    }

    function mintSplit(uint256 parentId, address to, string calldata uri) external onlyOwner returns (uint256) {
        require(_exists(parentId), "parent missing");
        uint256 id = _nextId();
        _safeMint(to, id);
        uint256[] memory parents = new uint256[](1);
        parents[0] = parentId;
        _meta[id] = StarterMeta({
            bornAt: uint64(block.timestamp),
            parentIds: parents,
            metadataURI: uri
        });
        emit StarterMinted(id, parents, to, uri);
        return id;
    }

    function mintMerge(uint256[] calldata parentIds, address to, string calldata uri) external onlyOwner returns (uint256) {
        require(parentIds.length >= 2, "need >=2 parents");
        for (uint i = 0; i < parentIds.length; i++) {
            require(_exists(parentIds[i]), "parent missing");
        }
        uint256 id = _nextId();
        _safeMint(to, id);
        _meta[id] = StarterMeta({
            bornAt: uint64(block.timestamp),
            parentIds: parentIds,
            metadataURI: uri
        });
        emit StarterMinted(id, parentIds, to, uri);
        return id;
    }

    // === Metadata & Anchors ===
    function updateURI(uint256 id, string calldata newURI) external {
        require(_exists(id), "missing");
        require(_isApprovedOrOwner(msg.sender, id) || owner() == msg.sender, "not allowed");
        _meta[id].metadataURI = newURI;
        emit MetadataUpdated(id, newURI);
    }

    function anchorEvents(uint256 id, bytes32 batchHash, string calldata kind) external {
        require(_exists(id), "missing");
        require(_isApprovedOrOwner(msg.sender, id) || owner() == msg.sender, "not allowed");
        emit EventAnchored(id, batchHash, kind); // kind: events|tags|snapshot|timecapsule
    }

    // === Views ===
    function getMeta(uint256 id) external view returns (StarterMeta memory) {
        require(_exists(id), "missing");
        return _meta[id];
    }

    function totalSupply() external view returns (uint256) {
        return _idCounter;
    }
}

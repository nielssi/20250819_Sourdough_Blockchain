import 'dotenv/config';
import { ethers } from 'ethers';
import abi from './SourdoughRegistry.abi.json' assert { type: 'json' };

export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);
export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
export const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abi, wallet);

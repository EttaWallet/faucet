# Lightning Testnet Faucet

```
yarn install
yarn build (dev)
yarn start
```

### API

```
curl -X POST \
  http://localhost:3000/api/faucet \
  -H 'Content-Type: application/json' \
  -d '{"sats":10000,"address":"bcrt1..."}'
```

```
curl -X POST \
  http://localhost:3000/api/invoice \
  -H 'Content-Type: application/json' \
  -d '{"bolt11": "..."}'
```

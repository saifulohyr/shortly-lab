# Shortly Lab deployment & environment guide

## Local / Host Deployment (PM2)
The application runs as a Node.js daemon via PM2 on port `3005`.

```bash
bash scripts/deploy.sh
```

## Cloudflare Tunnel Ingress Config
Add the following route to `/etc/cloudflared/config.yml`:

```yaml
ingress:
  - hostname: s.labmuma.xyz
    service: http://127.0.0.1:3005
```

Then reload cloudflared:
```bash
systemctl restart cloudflared
```

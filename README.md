run dev

docker compose -f docker-compose.dev.yml up --build -d

down dev

docker compose -f docker-compose.dev.yml down -v

docker context create mindak-agency --docker "host=ssh://root@82.29.172.217"

docker context use mindak-agency

docker swarm init

docker swarm join-token worker

docker network create -d overlay app-network

docker build -t mindak_web:latest ./web

```

```

docker build -t mindak_backend:latest ./backend

docker stack deploy -c ./docker-compose.prod.yml mindakstack

docker stack rm mindakstack

docker service logs mindakstack_nginx --tail 50

docker service update --force mindakstack_nginx


docker volume rm mindakstack_data

docker service rollback mindak_web



docker service inspect mindakstack_db-init --format '{{json .Spec.TaskTemplate.ContainerSpec.Env}}' | jq


sudo ufw status

sudo ufw allow 80/tcp

sudo ufw allow 443/tcp

sudo ufw allow 22/tcp

sudo ufw enable

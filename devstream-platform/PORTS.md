# DevStream Platform - Ports & Inbound Rules

When deploying to a cloud provider like AWS (ECS/EC2), you will need to configure your Security Group Inbound Rules. Below is a complete breakdown of the ports used in the DevStream architecture.

## Public / Host-Exposed Ports
These ports are mapped to the host machine in `docker-compose.yml`. If deploying the gateway and frontend directly to public instances, these are the ports you need to open in your Security Group to the outside world (0.0.0.0/0) or a load balancer.

| Service | Host Port | Container Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | `80` | `80` | TCP | Main entry point for backend APIs (`/api/auth`, `/api/projects`). Open this to allow API traffic. |
| **Frontend UI** | `3000` | `80` | TCP | React Dashboard mapped to port 3000 on the host to avoid conflict with the Gateway on port 80. Open this to access the UI. |
| **PostgreSQL DB** | `5432` | `5432` | TCP | Database port. **Warning:** Only open this port to your specific IP address if you need direct DB access for debugging. Do not open globally. |

---

## Internal / Private Ports
These ports are used for **internal container-to-container communication** within the Docker network. If deploying to AWS ECS via AWS Fargate, the services communicate over these ports within the VPC. You do **not** need to open these ports to the public internet, only between the service security groups.

| Service | Internal Port | Protocol | Accessed By |
| :--- | :--- | :--- | :--- |
| **Auth Service** | `3000` | TCP | API Gateway |
| **Project Service** | `8000` | TCP | API Gateway |
| **Metrics Worker** | `4000` | TCP | (Background job, `/health` endpoint internal) |

---

### Suggested AWS Security Group Setup (If Deploying)

**1. Public Load Balancer / Gateway Security Group**
- Inbound: Port `80` (HTTP) & `3000` (Frontend) from `0.0.0.0/0`.
- Outbound: All traffic to VPC.

**2. Internal Microservices Security Group (Auth, Project, Metrics)**
- Inbound: Port `3000`, `8000`, `4000` from the **Gateway Security Group ONLY**.

**3. Database Security Group (RDS / Postgres)**
- Inbound: Port `5432` from the **Internal Microservices Security Group ONLY**.

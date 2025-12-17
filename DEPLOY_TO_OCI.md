# Deploying to Oracle Cloud Infrastructure (OCI)

This app is now Dockerized and ready for cloud deployment.

## Option A: OCI Compute Instance (VM) - Simplest

1.  **Provision a VM**: Create a Compute instance on OCI (Ubuntu/Oracle Linux).
    *   Open Ports 80 and 3001 in the Security List (VCN).
2.  **Install Docker**: SSH into the VM and install Docker & Docker Compose.
3.  **Transfer Code**: Clone this repo onto the VM.
4.  **Run**:
    ```bash
    docker-compose up --build -d
    ```
    *   This will start the Database, Backend, and Frontend.
    *   **Data Persistence**: The `db_data` volume ensures your PostgreSQL data survives checking container restarts.

## Option B: OKE (Oracle Kubernetes Engine) - Scalable

1.  **Build Images**:
    *   `docker build -t <region>.ocir.io/<tenancy>/frontend ./`
    *   `docker build -t <region>.ocir.io/<tenancy>/backend ./server`
2.  **Push to OCIR**: Push these images to Oracle Container Registry.
3.  **Deploy**: Use Kubernetes manifests (Deployment/Service) to deploy.
    *   *Note: For the DB, it is recommended to use "OCI Database for PostgreSQL" (Managed Service) instead of a container for better reliability.*

## Environment Variables
Ensure you update the `DATABASE_URL` in `docker-compose.yml` or your OCI secrets if changing passwords.

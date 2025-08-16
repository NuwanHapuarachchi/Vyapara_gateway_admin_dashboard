### Running with Docker
## I have attached my compiled docker image here also. There was an error because of the public directory not existing, if any issues appear load the docker image or email the team leader.
https://drive.google.com/drive/folders/17T8Ra5TD3oKF6kaWU_lR40P-jpwd4dlO?usp=drive_link

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Vyapara_gateway_admin_dashboard-main
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Build and run the Docker container:**
   ```bash
   docker build -t vyapara-admin .
   docker run -p 3000:3000 vyapara-admin
   ```

4. **Access the application:**
   Open http://localhost:3000 in your browser

## Docker Image

### Import on another machine
```bash
# Load the image from tar file
docker load < vyapara-admin.tar

# Or from compressed file
gunzip -c vyapara-admin.tar.gz | docker load

# Then run the imported image
docker run -p 3000:3000 vyapara-admin
```


### Running Locally (Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file as described above.

3. **Run the development server:**
   ```bash
   npm run dev
   ```
## Troubleshooting

### Common Issues and Solutions

#### 1. **Build Error: Missing Supabase Environment Variables**
```
Error: Missing Supabase environment variables. Please check your .env.local file.
```
**Solution:** Ensure environment variables are set in the Dockerfile for the build stage:
```dockerfile
# In Dockerfile, add these lines before RUN npm run build
ENV NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

#### 2. **Build Error: Missing Public Directory**
```
ERROR: failed to solve: "/app/public": not found
```
**Solution:** Create the missing `public` directory:
```bash
mkdir public
echo "# Public Assets" > public/README.md
```

#### 3. **TypeScript Dependencies Missing**
```
It looks like you're trying to use TypeScript but do not have the required package(s) installed.
```
**Solution:** The build process will automatically install TypeScript dependencies. This is normal during the first build.

#### 4. **Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Use a different port:
```bash
docker run -p 3001:3000 vyapara-admin
```

#### 5. **Docker Image Not Found After Export/Import**
**Solution:** Always specify the tag when loading:
```bash
docker load -i vyapara-admin.tar
docker run -p 3000:3000 vyapara-admin:latest
```

#### 6. **Application Won't Start**
**Solution:** Check the container logs:
```bash
docker ps                          # Get container ID
docker logs <container-id>         # View logs
```

### Development Issues

#### Node.js Version Warning
```
Node.js 18 and below are deprecated and will no longer be supported
```

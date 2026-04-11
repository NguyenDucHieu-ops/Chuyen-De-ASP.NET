# Giai đoạn 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy file csproj và restore
COPY *.csproj ./
RUN dotnet restore

# Copy toàn bộ và build
COPY . ./
RUN dotnet publish -c Release -o out

# Giai đoạn 2: Chạy ứng dụng
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Cấu hình cổng chạy (Render sử dụng cổng 8080)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "NguyenDucHieu_2123110416.dll"]
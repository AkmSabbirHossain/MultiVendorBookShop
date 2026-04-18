# Build stage
FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["OnlineBookShop.Server.csproj", "./"]
RUN dotnet restore "OnlineBookShop.Server.csproj"
COPY . .
RUN dotnet publish "OnlineBookShop.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "OnlineBookShop.Server.dll"]
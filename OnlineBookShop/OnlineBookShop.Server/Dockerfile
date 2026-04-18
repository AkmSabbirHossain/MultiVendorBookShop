# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["OnlineBookShop.Server.csproj", "./"]
RUN dotnet restore "OnlineBookShop.Server.csproj"

COPY . .
RUN dotnet publish "OnlineBookShop.Server.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "OnlineBookShop.Server.dll"]
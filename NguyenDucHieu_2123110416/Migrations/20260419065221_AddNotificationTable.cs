using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NguyenDucHieu_2123110416.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LinkUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Banners",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931), new DateTime(2026, 5, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931) });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 19, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931), new DateTime(2026, 5, 4, 13, 52, 21, 226, DateTimeKind.Local).AddTicks(9931) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.UpdateData(
                table: "Banners",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830), new DateTime(2026, 5, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830) });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830), new DateTime(2026, 5, 4, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830) });
        }
    }
}

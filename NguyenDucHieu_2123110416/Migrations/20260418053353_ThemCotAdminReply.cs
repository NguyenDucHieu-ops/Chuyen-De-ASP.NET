using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NguyenDucHieu_2123110416.Migrations
{
    /// <inheritdoc />
    public partial class ThemCotAdminReply : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminReply",
                table: "Reviews",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Banners",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336));

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336), new DateTime(2026, 5, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336) });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 18, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336), new DateTime(2026, 5, 3, 12, 33, 49, 972, DateTimeKind.Local).AddTicks(2336) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminReply",
                table: "Reviews");

            migrationBuilder.UpdateData(
                table: "Banners",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392), new DateTime(2026, 5, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392) });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392), new DateTime(2026, 5, 3, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392) });
        }
    }
}

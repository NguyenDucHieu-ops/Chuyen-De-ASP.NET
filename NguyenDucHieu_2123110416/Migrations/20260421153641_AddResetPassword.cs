using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NguyenDucHieu_2123110416.Migrations
{
    /// <inheritdoc />
    public partial class AddResetPassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ResetPasswordExpiry",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResetPasswordToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Banners",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870));

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870), new DateTime(2026, 5, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870) });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 21, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870), new DateTime(2026, 5, 6, 22, 36, 38, 573, DateTimeKind.Local).AddTicks(9870) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResetPasswordExpiry",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ResetPasswordToken",
                table: "Users");

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
    }
}
